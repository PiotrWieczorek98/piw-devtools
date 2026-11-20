import { useLayoutEffect, useState } from 'react';

/** Reads a JSON value saved by writeStored; undefined when missing, unreadable or blocked. */
export function readStored<T>(key: string): T | undefined {
    try {
        const saved = localStorage.getItem(key);

        return saved === null ? undefined : (JSON.parse(saved) as T);
    } catch {
        return undefined;
    }
}

/** Saves a value as JSON; storage that is full or blocked just means nothing persists. */
export function writeStored(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Nothing to do; the value just won't survive a refresh.
    }
}

/**
 * useState that survives a page refresh via localStorage. The saved value is
 * restored after hydration (before paint) so server-rendered markup still matches.
 */
export function useStoredState<T>(
    key: string,
    initialValue: T,
): [T, (value: T) => void] {
    const [value, setValue] = useState(initialValue);

    useLayoutEffect(() => {
        const saved = readStored<T>(key);

        if (saved !== undefined) {
            setValue(saved);
        }
    }, [key]);

    const update = (next: T) => {
        setValue(next);
        writeStored(key, next);
    };

    return [value, update];
}
