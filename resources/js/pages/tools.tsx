import { Head } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import GlyphStreamBackground from '@/components/glyph-stream-background';
import Base64Tool from '@/components/tools/base64-tool';
import JsonFormatter from '@/components/tools/json-formatter';
import Generators from '@/components/tools/generators';
import PhpToJson from '@/components/tools/php-to-json';
import Reference from '@/components/tools/reference';
import { cn } from '@/lib/utils';

const tools = [
    { key: 'json', label: 'JSON formatter', component: JsonFormatter },
    { key: 'php', label: 'PHP ⇄ JSON', component: PhpToJson },
    { key: 'base64', label: 'Base64', component: Base64Tool },
    { key: 'generators', label: 'Generators', component: Generators },
    { key: 'reference', label: 'Reference', component: Reference },
];

export default function Tools() {
    const [active, setActive] = useState(tools[0].key);

    // Restore the tab from the URL hash after hydration, before paint, so SSR markup still matches.
    useLayoutEffect(() => {
        const saved = window.location.hash.slice(1);

        if (tools.some((tool) => tool.key === saved)) {
            setActive(saved);
        }
    }, []);

    const selectTool = (key: string) => {
        setActive(key);
        // Keep Inertia's history state; only the hash changes.
        window.history.replaceState(window.history.state, '', `#${key}`);
    };

    // Number keys switch tools, except while typing or with a modifier held.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;

            if (
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
            ) {
                return;
            }

            const tool = tools[Number(event.key) - 1];

            if (tool) {
                event.preventDefault();
                selectTool(tool.key);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    });

    return (
        <>
            <Head title="Tools" />
            <GlyphStreamBackground />
            <div className="relative min-h-screen text-foreground">
                <header className="sticky top-0 z-10 border-b bg-card/90">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-6 max-sm:contents">
                            <h1 className="flex items-baseline gap-1 text-base font-medium">
                                <span className="font-mono text-[17px]">
                                    <span className="text-primary">{'{'}</span>
                                    piw
                                    <span className="text-primary">{'}'}</span>
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    devtools
                                </span>
                            </h1>
                            <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 whitespace-nowrap max-sm:order-last max-sm:w-full">
                                {tools.map((tool, index) => (
                                    <button
                                        key={tool.key}
                                        type="button"
                                        onClick={() => selectTool(tool.key)}
                                        aria-current={
                                            active === tool.key
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(
                                            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                            active === tool.key &&
                                                'bg-accent text-foreground',
                                        )}
                                    >
                                        {tool.label}
                                        <kbd className="hidden h-4 min-w-4 place-items-center rounded border px-1 font-mono text-[11px] leading-none text-muted-foreground sm:grid">
                                            {index + 1}
                                        </kbd>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <AppearanceToggleTab />
                    </div>
                </header>
                <main className="mx-auto max-w-7xl px-4 py-6">
                    <div className="rounded-xl border bg-card/90 p-4 sm:p-6">
                        {tools.map(({ key, component: Tool }) => (
                            <section key={key} hidden={active !== key}>
                                <Tool />
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
