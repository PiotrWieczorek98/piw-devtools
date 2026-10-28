import { expect, test } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';

test('round-trips UTF-8 text', () => {
    expect(encodeBase64('zażółć ?>')).toBe('emHFvMOzxYLEhyA/Pg==');
    expect(decodeBase64('emHFvMOzxYLEhyA/Pg==')).toBe('zażółć ?>');
});

test('handles the URL-safe alphabet without padding', () => {
    expect(encodeBase64('zażółć ?>', true)).toBe('emHFvMOzxYLEhyA_Pg');
    expect(decodeBase64('emHFvMOzxYLEhyA_Pg')).toBe('zażółć ?>');
});

test('rejects invalid Base64 and binary data', () => {
    expect(() => decodeBase64('not base64!')).toThrow('Not a valid Base64');
    expect(() => decodeBase64('/w==')).toThrow('binary');
});
