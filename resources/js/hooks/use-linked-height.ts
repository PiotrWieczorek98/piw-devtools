import { useEffect, useRef } from 'react';

export function useLinkedHeight<T extends HTMLElement>() {
    const first = useRef<T>(null);
    const second = useRef<T>(null);

    useEffect(() => {
        const a = first.current;
        const b = second.current;

        if (!a || !b) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const source = entry.target as T;
                const target = source === a ? b : a;

                if (
                    source.style.height &&
                    target.style.height !== source.style.height
                ) {
                    target.style.height = source.style.height;
                }
            }
        });

        observer.observe(a);
        observer.observe(b);

        return () => observer.disconnect();
    }, []);

    return [first, second] as const;
}
