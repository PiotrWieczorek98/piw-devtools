/**
 * UTF-8 aware Base64 helpers (btoa/atob only handle Latin-1 on their own).
 */
export function encodeBase64(text: string, urlSafe = false): string {
    const bytes = new TextEncoder().encode(text);
    const encoded = btoa(
        Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''),
    );

    return urlSafe
        ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        : encoded;
}

/**
 * Accepts standard and URL-safe alphabets, missing padding and whitespace.
 * Throws when the input is not Base64 or does not decode to UTF-8 text.
 */
export function decodeBase64(input: string): string {
    const normalized = input
        .replace(/\s/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    let binary: string;

    try {
        binary = atob(padded);
    } catch {
        throw new Error('Not a valid Base64 string.');
    }

    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(
            Uint8Array.from(binary, (char) => char.charCodeAt(0)),
        );
    } catch {
        throw new Error('Decoded data is binary, not UTF-8 text.');
    }
}
