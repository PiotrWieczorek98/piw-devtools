import { useHttp } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import {
    CopyButton,
    IndentToggle,
    textareaClassName,
} from '@/components/tools/shared';
import { Label } from '@/components/ui/label';
import { useLinkedHeight } from '@/hooks/use-linked-height';
import { formatJson } from '@/lib/json-format';
import { phpToJson } from '@/routes/tools';

export default function PhpToJson() {
    const [inputRef, outputRef] = useLinkedHeight<HTMLTextAreaElement>();
    const http = useHttp<{ input: string }, { json: string }>({ input: '' });
    const [indent, setIndent] = useState('  ');
    const input = http.data.input;

    useEffect(() => {
        if (input.trim() === '') {
            return;
        }

        const timeout = setTimeout(
            () => http.post(phpToJson.url()).catch(() => {}),
            300,
        );

        return () => {
            clearTimeout(timeout);
            http.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input]);

    const error = input.trim() === '' ? undefined : http.errors.input;
    const output =
        input.trim() === '' || error || !http.response
            ? ''
            : formatJson(http.response.json, indent);

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-2">
                <Label htmlFor="php-input" className="min-h-8">
                    PHP serialized
                </Label>
                <textarea
                    ref={inputRef}
                    id="php-input"
                    className={textareaClassName}
                    spellCheck={false}
                    placeholder='a:2:{s:3:"foo";s:3:"bar";i:0;b:1;}'
                    aria-invalid={!!error}
                    value={input}
                    onChange={(e) => http.setData('input', e.target.value)}
                />
                <InputError message={error} />
            </div>
            <div className="grid content-start gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="php-output">JSON</Label>
                    <div className="flex flex-wrap gap-2">
                        <IndentToggle value={indent} onChange={setIndent} />
                        <CopyButton text={output} />
                    </div>
                </div>
                <textarea
                    ref={outputRef}
                    id="php-output"
                    className={textareaClassName}
                    spellCheck={false}
                    readOnly
                    value={output}
                />
            </div>
        </div>
    );
}
