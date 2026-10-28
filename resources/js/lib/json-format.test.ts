import { expect, test } from 'vitest';
import { formatJson } from './json-format';

const source =
    '{ "b": 1, "2": [ ], "a": { "s": "x, {y}: \\"z\\"" }, "n": 12345678901234567890 }';

test('beautifies preserving key order, strings and big numbers', () => {
    expect(formatJson(source, '  ')).toBe(
        '{\n  "b": 1,\n  "2": [],\n  "a": {\n    "s": "x, {y}: \\"z\\""\n  },\n  "n": 12345678901234567890\n}',
    );
});

test('minifies', () => {
    expect(formatJson(source, '')).toBe(
        '{"b":1,"2":[],"a":{"s":"x, {y}: \\"z\\""},"n":12345678901234567890}',
    );
});
