import { useState } from 'react';
import InputError from '@/components/input-error';
import { CopyButton, textareaClassName } from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { decodeBase64, encodeBase64 } from '@/lib/base64';

function convert(
    input: string,
    mode: string,
    urlSafe: boolean,
): { output: string; error?: string } {
    try {
        return {
            output:
                mode === 'encode'
                    ? encodeBase64(input, urlSafe)
                    : decodeBase64(input),
        };
    } catch (error) {
        return {
            output: '',
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export default function Base64Tool() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('encode');
    const [urlSafe, setUrlSafe] = useState(false);

    const { output, error } =
        input === '' ? { output: '' } : convert(input, mode, urlSafe);

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="base64-input">
                        {mode === 'encode' ? 'Text' : 'Base64'}
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            size="sm"
                            value={mode}
                            onValueChange={(next) => next && setMode(next)}
                        >
                            <ToggleGroupItem value="encode" className="px-3">
                                Encode
                            </ToggleGroupItem>
                            <ToggleGroupItem value="decode" className="px-3">
                                Decode
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!output}
                            onClick={() => {
                                setInput(output);
                                setMode(
                                    mode === 'encode' ? 'decode' : 'encode',
                                );
                            }}
                        >
                            Swap
                        </Button>
                    </div>
                </div>
                <textarea
                    id="base64-input"
                    className={textareaClassName}
                    spellCheck={false}
                    aria-invalid={!!error}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <InputError message={error} />
            </div>
            <div className="grid content-start gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="base64-output">
                        {mode === 'encode' ? 'Base64' : 'Text'}
                    </Label>
                    <div className="flex flex-wrap items-center gap-4">
                        {mode === 'encode' && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="base64-url-safe"
                                    checked={urlSafe}
                                    onCheckedChange={(checked) =>
                                        setUrlSafe(checked === true)
                                    }
                                />
                                <Label htmlFor="base64-url-safe">
                                    URL-safe
                                </Label>
                            </div>
                        )}
                        <CopyButton text={output} />
                    </div>
                </div>
                <textarea
                    id="base64-output"
                    className={textareaClassName}
                    spellCheck={false}
                    readOnly
                    value={output}
                />
            </div>
        </div>
    );
}
