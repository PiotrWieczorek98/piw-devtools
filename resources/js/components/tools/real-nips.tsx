import { CopyValue } from '@/components/tools/shared';

// Verified against the MF VAT white list (wl-api.mf.gov.pl) on 2026-10-28; names as registered.
// prettier-ignore
const companies = [
    { nip: '7740001454', regon: '610188201', name: 'ORLEN S.A.' },
    { nip: '5250007738', regon: '016298263', name: 'PKO Bank Polski S.A.' },
    { nip: '5260251049', regon: '010001345', name: 'PZU S.A.' },
    { nip: '6920000013', regon: '390021764', name: 'KGHM Polska Miedź S.A.' },
    { nip: '5252674798', regon: '365331553', name: 'Allegro sp. z o.o.' },
    { nip: '7342867148', regon: '492707333', name: 'CD PROJEKT RED S.A.' },
    { nip: '5831014898', regon: '190852164', name: 'LPP S.A.' },
    { nip: '5260250995', regon: '012100784', name: 'Orange Polska S.A.' },
    { nip: '5260215088', regon: '001254524', name: 'mBank S.A.' },
    { nip: '6770065406', regon: '350527377', name: 'Comarch S.A.' },
];

export default function RealNips() {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-3 py-2 font-medium">Company</th>
                        <th className="px-3 py-2 font-medium">NIP</th>
                        <th className="px-3 py-2 font-medium">REGON</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {companies.map((company) => (
                        <tr key={company.nip}>
                            <td className="px-3 py-1.5">
                                <CopyValue text={company.name} />
                            </td>
                            <td className="px-3 py-1.5">
                                <CopyValue
                                    text={company.nip}
                                    className="font-mono"
                                />
                            </td>
                            <td className="px-3 py-1.5">
                                <CopyValue
                                    text={company.regon}
                                    className="font-mono"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
