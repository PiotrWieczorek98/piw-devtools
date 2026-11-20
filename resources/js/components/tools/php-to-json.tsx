import { useHttp } from '@inertiajs/react';
import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useLayoutEffect } from 'react';
import InputError from '@/components/input-error';
import {
    CopyButton,
    IndentToggle,
    textareaClassName,
} from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLinkedHeight } from '@/hooks/use-linked-height';
import {
    readStored,
    useStoredState,
    writeStored,
} from '@/hooks/use-stored-state';
import { formatJson } from '@/lib/json-format';
import { jsonToPhp, phpToJson } from '@/routes/tools';

export default function PhpToJson() {
    const [inputRef, outputRef] = useLinkedHeight<HTMLTextAreaElement>();
    const http = useHttp<{ input: string }, { json?: string; php?: string }>({
        input: '',
    });
    const [indent, setIndent] = useStoredState('php-json-indent', '  ');
    const [toJson, setToJson] = useStoredState('php-json-to-json', true);

    const setInput = (value: string) => {
        http.setData('input', value);
        writeStored('php-json-input', value);
    };

    // The input lives in the useHttp form, so it is restored by hand after hydration.
    useLayoutEffect(() => {
        const saved = readStored<string>('php-json-input');

        if (saved) {
            http.setData('input', saved);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const input = http.data.input;

    useEffect(() => {
        if (input.trim() === '') {
            return;
        }

        const url = toJson ? phpToJson.url() : jsonToPhp.url();
        const timeout = setTimeout(() => http.post(url).catch(() => {}), 300);

        return () => {
            clearTimeout(timeout);
            http.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, toJson]);

    const error = input.trim() === '' ? undefined : http.errors.input;
    const result = toJson ? http.response?.json : http.response?.php;
    const output =
        input.trim() === '' || error || result === undefined
            ? ''
            : toJson
              ? formatJson(result, indent)
              : result;

    const swap = () => {
        setToJson(!toJson);
        setInput(output);
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-2">
                <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="php-input">
                        {toJson ? 'PHP serialized' : 'JSON'}
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={swap}
                    >
                        <ArrowLeftRight /> Swap
                    </Button>
                </div>
                <textarea
                    ref={inputRef}
                    id="php-input"
                    className={textareaClassName}
                    spellCheck={false}
                    placeholder={
                        toJson
                            ? 'a:2:{s:3:"foo";s:3:"bar";i:0;b:1;}'
                            : '{"foo": "bar", "0": true}'
                    }
                    aria-invalid={!!error}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <InputError message={error} />
            </div>
            <div className="grid content-start gap-2">
                <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="php-output">
                        {toJson ? 'JSON' : 'PHP serialized'}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {toJson && (
                            <IndentToggle value={indent} onChange={setIndent} />
                        )}
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
