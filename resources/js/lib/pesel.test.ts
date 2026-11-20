import { expect, test } from 'vitest';
import { describePesel } from './pesel';

test('reads a 1900s birth date and male sex', () => {
    expect(describePesel('92071412357')).toEqual({
        birthDate: '1992-07-14',
        sex: 'M',
    });
});

test('reads a 2000s birth date from the +20 month offset and female sex', () => {
    expect(describePesel('05250312340')).toEqual({
        birthDate: '2005-05-03',
        sex: 'F',
    });
});

test('reads the 1800s from the +80 month offset', () => {
    expect(describePesel('99921012345')?.birthDate).toBe('1899-12-10');
});

test('rejects malformed input', () => {
    expect(describePesel('123')).toBeNull();
    expect(describePesel('92001412357')).toBeNull();
});
