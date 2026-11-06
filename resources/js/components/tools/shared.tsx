import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';

export const textareaClassName =
    'min-h-80 w-full rounded-md border border-input bg-transparent p-3 font-mono text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive';

export function CopyButton({
    text,
    label = 'Copy',
}: {
    text: string;
    label?: string;
}) {
    const [copiedText, copy] = useClipboard();
    const [wasClicked, setWasClicked] = useState(false);
    const copied = copiedText === text && text !== '';

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={text === ''}
            onClick={() => {
                setWasClicked(true);
                void copy(text);
            }}
        >
            <span className="grid justify-items-center gap-[inherit] *:col-start-1 *:row-start-1">
                <span
                    key={copied ? 'copied' : 'copy'}
                    className={cn(
                        'inline-flex items-center gap-[inherit]',
                        // Only animate after a click, not when a freshly rendered button mounts.
                        wasClicked &&
                            'animate-in duration-200 zoom-in-75 fade-in motion-reduce:animate-none',
                    )}
                >
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Copied' : label}
                </span>
                <span
                    aria-hidden
                    className="invisible inline-flex items-center gap-[inherit]"
                >
                    {copied ? <Copy /> : <Check />}
                    {copied ? label : 'Copied'}
                </span>
            </span>
        </Button>
    );
}

export function GenerateButton({ processing }: { processing: boolean }) {
    const [clicks, setClicks] = useState(0);

    return (
        <Button
            type="submit"
            disabled={processing}
            className="disabled:opacity-100"
            onClick={() => setClicks(clicks + 1)}
        >
            <RefreshCw
                key={clicks}
                className={cn(
                    clicks > 0 &&
                        'animate-in duration-500 ease-out spin-in-180 motion-reduce:animate-none',
                )}
            />
            Generate
        </Button>
    );
}

const indents = [
    { value: '  ', label: '2 spaces' },
    { value: '    ', label: '4 spaces' },
    { value: '\t', label: 'Tab' },
    { value: '', label: 'Minify' },
];

export function IndentToggle({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={JSON.stringify(value)}
            onValueChange={(next) => next && onChange(JSON.parse(next))}
        >
            {indents.map((indent) => (
                <ToggleGroupItem
                    key={indent.label}
                    value={JSON.stringify(indent.value)}
                    className="px-3"
                >
                    {indent.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

export function NumberList({ numbers }: { numbers: string[] }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-end">
                <CopyButton text={numbers.join('\n')} label="Copy all" />
            </div>
            <ul className="divide-y rounded-md border">
                {numbers.map((number, index) => (
                    <li
                        key={`${index}-${number}`}
                        className="flex items-center justify-between px-3 py-1.5"
                    >
                        <span className="font-mono">{number}</span>
                        <CopyButton text={number} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
