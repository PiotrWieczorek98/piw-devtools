import { CircleCheck, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import {
    CopyButton,
    IndentToggle,
    textareaClassName,
} from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLinkedHeight } from '@/hooks/use-linked-height';
import { formatJson } from '@/lib/json-format';
import { cn } from '@/lib/utils';

function validate(text: string): string | undefined {
    try {
        JSON.parse(text);
    } catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
}

const MEMORY_STORAGE_KEY = 'json-formatter-slots';

type MemorySlot = { title: string; text: string };

function loadMemory(): MemorySlot[] {
    const defaults = [
        { title: '', text: '' },
        { title: '', text: '' },
    ];

    try {
        const saved = JSON.parse(
            localStorage.getItem(MEMORY_STORAGE_KEY) ?? 'null',
        );

        if (!Array.isArray(saved)) {
            return defaults;
        }

        // Earlier versions stored a fixed row of plain strings, mostly empty.
        if (saved.some((slot) => typeof slot === 'string')) {
            const kept = saved
                .filter((slot) => typeof slot === 'string' && slot !== '')
                .map((text) => ({ title: '', text }));

            return kept.length ? kept : defaults;
        }

        return saved.map((slot) => ({
            title: String(slot?.title ?? ''),
            text: String(slot?.text ?? ''),
        }));
    } catch {
        return defaults;
    }
}

function Memory({ onLoad }: { onLoad: (text: string) => void }) {
    const [slots, setSlots] = useState(loadMemory);

    useEffect(() => {
        try {
            localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(slots));
        } catch {
            // Storage full or blocked; slots just won't persist.
        }
    }, [slots]);

    const updateSlot = (index: number, change: Partial<MemorySlot>) =>
        setSlots(
            slots.map((slot, i) =>
                i === index ? { ...slot, ...change } : slot,
            ),
        );

    return (
        <section className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="font-medium">Memory</h2>
                    <p className="text-sm text-muted-foreground">
                        Saved in this browser, kept between visits.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setSlots([...slots, { title: '', text: '' }])
                    }
                >
                    <Plus /> Add slot
                </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                {slots.map((slot, index) => (
                    <div
                        key={index}
                        className="grid content-start gap-2 rounded-md border p-3"
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                aria-label={`Memory slot ${index + 1} title`}
                                placeholder={`Slot ${index + 1}`}
                                value={slot.title}
                                onChange={(e) =>
                                    updateSlot(index, { title: e.target.value })
                                }
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={slot.text.trim() === ''}
                                onClick={() => onLoad(slot.text)}
                            >
                                Load to input
                            </Button>
                            <CopyButton text={slot.text} />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete memory slot ${index + 1}`}
                                onClick={() =>
                                    setSlots(
                                        slots.filter((_, i) => i !== index),
                                    )
                                }
                            >
                                <Trash2 />
                            </Button>
                        </div>
                        <textarea
                            aria-label={`Memory slot ${index + 1} content`}
                            className={cn(textareaClassName, 'min-h-40')}
                            spellCheck={false}
                            placeholder="Paste text to keep"
                            value={slot.text}
                            onChange={(e) =>
                                updateSlot(index, { text: e.target.value })
                            }
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function JsonFormatter() {
    const [inputRef, outputRef] = useLinkedHeight<HTMLTextAreaElement>();
    const [input, setInput] = useState('');
    const [indent, setIndent] = useState('  ');

    const isEmpty = input.trim() === '';
    const error = isEmpty ? undefined : validate(input);
    const output = isEmpty || error ? '' : formatJson(input, indent);

    return (
        <div className="grid gap-8">
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid content-start gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="json-input">Input</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!output}
                                onClick={() => setInput(output)}
                            >
                                Apply to input
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isEmpty}
                                onClick={() => setInput('')}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                    <textarea
                        ref={inputRef}
                        id="json-input"
                        className={textareaClassName}
                        spellCheck={false}
                        placeholder='{"paste": "your JSON here"}'
                        aria-invalid={!!error}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <InputError message={error && `Invalid JSON: ${error}`} />
                    {output && (
                        <p className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CircleCheck className="size-4" /> Valid JSON
                        </p>
                    )}
                </div>
                <div className="grid content-start gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="json-output">Output</Label>
                        <div className="flex flex-wrap gap-2">
                            <IndentToggle value={indent} onChange={setIndent} />
                            <CopyButton text={output} />
                        </div>
                    </div>
                    <textarea
                        ref={outputRef}
                        id="json-output"
                        className={textareaClassName}
                        spellCheck={false}
                        readOnly
                        value={output}
                    />
                </div>
            </div>
            <Memory onLoad={setInput} />
        </div>
    );
}
