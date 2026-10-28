import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import {
    CopyButton,
    IndentToggle,
    textareaClassName,
} from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatJson } from '@/lib/json-format';

function validate(text: string): string | undefined {
    try {
        JSON.parse(text);
    } catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
}

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [indent, setIndent] = useState('    ');

    const isEmpty = input.trim() === '';
    const error = isEmpty ? undefined : validate(input);
    const output = isEmpty || error ? '' : formatJson(input, indent);

    return (
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
                    id="json-output"
                    className={textareaClassName}
                    spellCheck={false}
                    readOnly
                    value={output}
                />
            </div>
        </div>
    );
}
