const whitespace = new Set([' ', '\n', '\r', '\t']);

/**
 * Re-indent already valid JSON text without parsing it into JS values,
 * so key order and big-number precision are preserved. An empty indent minifies.
 */
export function formatJson(text: string, indent: string): string {
    const newline = indent ? '\n' : '';
    let output = '';
    let depth = 0;
    let inString = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inString) {
            output += char;

            if (char === '\\') {
                output += text[++i];
            } else if (char === '"') {
                inString = false;
            }

            continue;
        }

        if (whitespace.has(char)) {
            continue;
        }

        if (char === '{' || char === '[') {
            let next = i + 1;

            while (whitespace.has(text[next])) {
                next++;
            }

            // Keep empty containers on one line.
            if (text[next] === (char === '{' ? '}' : ']')) {
                output += char + text[next];
                i = next;
            } else {
                depth++;
                output += char + newline + indent.repeat(depth);
            }
        } else if (char === '}' || char === ']') {
            depth--;
            output += newline + indent.repeat(depth) + char;
        } else if (char === ',') {
            output += ',' + newline + indent.repeat(depth);
        } else if (char === ':') {
            output += indent ? ': ' : ':';
        } else {
            if (char === '"') {
                inString = true;
            }

            output += char;
        }
    }

    return output;
}
