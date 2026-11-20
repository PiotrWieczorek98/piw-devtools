import { Head } from '@inertiajs/react';
import { useLayoutEffect, useState } from 'react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import GlyphStreamBackground from '@/components/glyph-stream-background';
import Base64Tool from '@/components/tools/base64-tool';
import Identifiers from '@/components/tools/identifiers';
import JsonFormatter from '@/components/tools/json-formatter';
import PhpToJson from '@/components/tools/php-to-json';
import { cn } from '@/lib/utils';

const tools = [
    { key: 'json', label: 'JSON formatter', component: JsonFormatter },
    { key: 'php', label: 'PHP ⇄ JSON', component: PhpToJson },
    { key: 'base64', label: 'Base64', component: Base64Tool },
    { key: 'ids', label: 'Polish data', component: Identifiers },
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

    return (
        <>
            <Head title="Tools" />
            <GlyphStreamBackground />
            <div className="relative min-h-screen text-foreground">
                <header className="sticky top-0 z-10 border-b bg-card/90">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-6">
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
                            <nav className="flex flex-wrap gap-1">
                                {tools.map((tool) => (
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
                                            'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                            active === tool.key &&
                                                'bg-accent text-foreground',
                                        )}
                                    >
                                        {tool.label}
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
