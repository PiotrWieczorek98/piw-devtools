import { CopyButton } from '@/components/tools/shared';

// Verified against the MF VAT white list (wl-api.mf.gov.pl) on 2026-10-28; names as registered.
const companies = [
    { nip: '7740001454', regon: '610188201', name: 'ORLEN S.A.' },
    { nip: '5250007738', regon: '016298263', name: 'PKO Bank Polski S.A.' },
    { nip: '5260251049', regon: '010001345', name: 'PZU S.A.' },
    { nip: '6920000013', regon: '390021764', name: 'KGHM Polska Miedź S.A.' },
    { nip: '5272468122', regon: '140086881', name: 'IPOPEMA Securities S.A.' },
    { nip: '5252674798', regon: '365331553', name: 'Allegro sp. z o.o.' },
    { nip: '7342867148', regon: '492707333', name: 'CD PROJEKT RED S.A.' },
    { nip: '5831014898', regon: '190852164', name: 'LPP S.A.' },
    { nip: '5260250995', regon: '012100784', name: 'Orange Polska S.A.' },
    { nip: '5250007313', regon: '010684960', name: 'Poczta Polska S.A.' },
    { nip: '5260006841', regon: '000010205', name: 'Bank Pekao S.A.' },
    { nip: '5260215088', regon: '001254524', name: 'mBank S.A.' },
    { nip: '8960005673', regon: '930041341', name: 'Erste Bank Polska S.A.' },
    { nip: '6340135475', regon: '271514909', name: 'ING Bank Śląski S.A.' },
    { nip: '7791011327', regon: '630303023', name: 'Jeronimo Martins Polska S.A.' },
    { nip: '5220002529', regon: '000288975', name: 'Uniwersyteckie Centrum Kliniczne WUM' },
    { nip: '6770065406', regon: '350527377', name: 'Comarch S.A.' },
    { nip: '7961810732', regon: '670925160', name: 'Cyfrowy Polsat S.A.' },
    { nip: '9542583988', regon: '240524697', name: 'TAURON Polska Energia S.A.' },
    { nip: '7770020640', regon: '630139960', name: 'ENEA S.A.' },
    { nip: '8730006829', regon: '850002268', name: 'Grupa Azoty S.A.' },
    { nip: '5270103391', regon: '010016565', name: 'Microsoft sp. z o.o.' },
    { nip: '5252344078', regon: '140182840', name: 'Google Poland sp. z o.o.' },
    { nip: '7811897358', regon: '302821772', name: 'Lidl sp. z o.o. sp.k.' },
    { nip: '5250008028', regon: '012216736', name: 'PGNiG S.A.' },
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
                            <td className="px-3 py-1.5">{company.name}</td>
                            <td className="px-3 py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">
                                        {company.nip}
                                    </span>
                                    <CopyButton text={company.nip} />
                                </div>
                            </td>
                            <td className="px-3 py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">
                                        {company.regon}
                                    </span>
                                    <CopyButton text={company.regon} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
