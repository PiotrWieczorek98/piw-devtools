/** Month offsets encode the century: +80 → 1800s, +0 → 1900s, +20 → 2000s, +40 → 2100s, +60 → 2200s. */
const centuries = [
    { offset: 80, century: 1800 },
    { offset: 0, century: 1900 },
    { offset: 20, century: 2000 },
    { offset: 40, century: 2100 },
    { offset: 60, century: 2200 },
];

export type PeselDetails = { birthDate: string; sex: 'F' | 'M' };

/**
 * Reads the birth date and sex encoded in a PESEL. Assumes the number is
 * well-formed (as the generator returns it); returns null otherwise.
 */
export function describePesel(pesel: string): PeselDetails | null {
    if (!/^\d{11}$/.test(pesel)) {
        return null;
    }

    const encodedMonth = Number(pesel.slice(2, 4));
    const era = centuries.find(
        ({ offset }) => encodedMonth > offset && encodedMonth <= offset + 12,
    );

    if (!era) {
        return null;
    }

    const year = era.century + Number(pesel.slice(0, 2));
    const month = String(encodedMonth - era.offset).padStart(2, '0');

    return {
        birthDate: `${year}-${month}-${pesel.slice(4, 6)}`,
        sex: Number(pesel[9]) % 2 === 0 ? 'F' : 'M',
    };
}
