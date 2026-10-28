import { useHttp } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { NumberList } from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { nip } from '@/routes/tools';

export default function NipGenerator() {
    const http = useHttp<{ count: number }, { numbers: string[] }>({
        count: 10,
    });
    const [dashed, setDashed] = useState(false);

    const generate = (event?: FormEvent) => {
        event?.preventDefault();
        void http.post(nip.url());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => generate(), []);

    const numbers = (http.response?.numbers ?? []).map((number) =>
        dashed
            ? number.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1-$2-$3-$4')
            : number,
    );

    return (
        <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
            <form onSubmit={generate} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="nip-count">How many</Label>
                    <Input
                        id="nip-count"
                        type="number"
                        min={1}
                        max={100}
                        value={http.data.count}
                        onChange={(e) =>
                            http.setData('count', Number(e.target.value))
                        }
                    />
                    <InputError message={http.errors.count} />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="nip-dashed"
                        checked={dashed}
                        onCheckedChange={(checked) =>
                            setDashed(checked === true)
                        }
                    />
                    <Label htmlFor="nip-dashed">Format as XXX-XXX-XX-XX</Label>
                </div>
                <Button type="submit" disabled={http.processing}>
                    Generate
                </Button>
            </form>
            <NumberList numbers={numbers} />
        </div>
    );
}
