import { CopyValue } from '@/components/tools/shared';

// shortcut: city hall postal codes from memory, not checked against the Poczta Polska register; verify before relying on one.
// prettier-ignore
const places = [
    { code: '00-901', city: 'Warszawa' },
    { code: '31-004', city: 'Kraków' },
    { code: '90-926', city: 'Łódź' },
    { code: '50-107', city: 'Wrocław' },
    { code: '61-841', city: 'Poznań' },
    { code: '80-803', city: 'Gdańsk' },
    { code: '70-456', city: 'Szczecin' },
    { code: '85-102', city: 'Bydgoszcz' },
    { code: '20-109', city: 'Lublin' },
    { code: '15-950', city: 'Białystok' },
];

export default function PostalCodes() {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-3 py-2 font-medium">City</th>
                        <th className="px-3 py-2 font-medium">Postal code</th>
                        <th className="px-3 py-2 font-medium">Code and city</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {places.map((place) => (
                        <tr key={place.code}>
                            <td className="px-3 py-1.5">
                                <CopyValue text={place.city} />
                            </td>
                            <td className="px-3 py-1.5">
                                <CopyValue
                                    text={place.code}
                                    className="font-mono"
                                />
                            </td>
                            <td className="px-3 py-1.5">
                                <CopyValue
                                    text={`${place.code} ${place.city}`}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
