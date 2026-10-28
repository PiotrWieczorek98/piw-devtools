import { useHttp } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { NumberList } from '@/components/tools/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { pesel } from '@/routes/tools';

export default function PeselGenerator() {
    const http = useHttp<
        { count: number; birth_date: string; sex: string },
        { numbers: string[] }
    >({ count: 10, birth_date: '', sex: 'any' });

    const generate = (event?: FormEvent) => {
        event?.preventDefault();
        void http.post(pesel.url());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => generate(), []);

    return (
        <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
            <form onSubmit={generate} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="pesel-count">How many</Label>
                    <Input
                        id="pesel-count"
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
                <div className="grid gap-2">
                    <Label htmlFor="pesel-birth-date">
                        Birth date (empty = random)
                    </Label>
                    <Input
                        id="pesel-birth-date"
                        type="date"
                        min="1800-01-01"
                        max="2299-12-31"
                        value={http.data.birth_date}
                        onChange={(e) =>
                            http.setData('birth_date', e.target.value)
                        }
                    />
                    <InputError message={http.errors.birth_date} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pesel-sex">Sex</Label>
                    <Select
                        value={http.data.sex}
                        onValueChange={(value) => http.setData('sex', value)}
                    >
                        <SelectTrigger id="pesel-sex" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={http.errors.sex} />
                </div>
                <Button type="submit" disabled={http.processing}>
                    Generate
                </Button>
            </form>
            <NumberList numbers={http.response?.numbers ?? []} />
        </div>
    );
}
