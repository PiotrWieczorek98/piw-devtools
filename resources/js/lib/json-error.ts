export type JsonErrorLocation = {
    line: number;
    column: number;
    offset: number;
};

const whitespace = ' \t\n\r';
const numberPattern = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const hexPattern = /[0-9a-fA-F]{4}/y;

/**
 * Finds where JSON first goes wrong. Engines disagree on error messages (and
 * current V8 reports no position at all), so this scans the grammar itself.
 * Returns null for valid JSON.
 */
export function locateJsonError(text: string): JsonErrorLocation | null {
    let i = 0;
    // Thrown to unwind the recursion straight to the failing offset.
    const fail = (): never => {
        throw i;
    };
    const skipWhitespace = () => {
        while (i < text.length && whitespace.includes(text[i])) {
            i++;
        }
    };

    const string = () => {
        i++;

        while (i < text.length) {
            const character = text[i];

            if (character === '"') {
                i++;

                return;
            }

            if (character === '\\') {
                i++;

                if (text[i] === 'u') {
                    i++;
                    hexPattern.lastIndex = i;

                    if (!hexPattern.test(text)) {
                        fail();
                    }

                    i += 4;
                    continue;
                }

                if (!'"\\/bfnrt'.includes(text[i] ?? 'x')) {
                    fail();
                }

                i++;
                continue;
            }

            if (character < ' ') {
                fail();
            }

            i++;
        }

        fail();
    };

    const value = (): void => {
        skipWhitespace();
        const character = text[i];

        if (character === '{' || character === '[') {
            const isObject = character === '{';
            const close = isObject ? '}' : ']';
            i++;
            skipWhitespace();

            if (text[i] === close) {
                i++;

                return;
            }

            for (;;) {
                if (isObject) {
                    skipWhitespace();

                    if (text[i] !== '"') {
                        fail();
                    }

                    string();
                    skipWhitespace();

                    if (text[i] !== ':') {
                        fail();
                    }

                    i++;
                }

                value();
                skipWhitespace();

                if (text[i] === ',') {
                    i++;
                    continue;
                }

                if (text[i] === close) {
                    i++;

                    return;
                }

                fail();
            }
        }

        if (character === '"') {
            return string();
        }

        for (const word of ['true', 'false', 'null']) {
            if (text.startsWith(word, i)) {
                i += word.length;

                return;
            }
        }

        numberPattern.lastIndex = i;
        const number = numberPattern.exec(text);

        if (number) {
            i += number[0].length;

            return;
        }

        fail();
    };

    try {
        value();
        skipWhitespace();

        if (i < text.length) {
            fail();
        }

        return null;
    } catch (offset) {
        const before = text.slice(0, offset as number).split('\n');

        return {
            line: before.length,
            column: before[before.length - 1].length + 1,
            offset: offset as number,
        };
    }
}
