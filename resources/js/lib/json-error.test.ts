import { expect, test } from 'vitest';
import { locateJsonError } from './json-error';

test('returns null for valid JSON', () => {
    expect(
        locateJsonError('{ "a": [1, -2.5e3, true, null, "x\\n\\u00e9"] }'),
    ).toBeNull();
});

test('points at an unexpected token on a later line', () => {
    expect(locateJsonError('{\n  "a": 1,\n  "b": }')).toEqual({
        line: 3,
        column: 8,
        offset: 19,
    });
});

test('points at a trailing comma', () => {
    expect(locateJsonError('[1, 2,]')).toEqual({
        line: 1,
        column: 7,
        offset: 6,
    });
});

test('points at an unquoted key', () => {
    expect(locateJsonError('{"a": 1, b: 2}')?.offset).toBe(9);
});

test('points at the end for truncated input', () => {
    expect(locateJsonError('{"a":')).toEqual({
        line: 1,
        column: 6,
        offset: 5,
    });
});

test('points at text after a complete value', () => {
    expect(locateJsonError('{} x')?.offset).toBe(3);
});

test('rejects a bad escape', () => {
    expect(locateJsonError('"a\\q"')?.offset).toBe(3);
});
