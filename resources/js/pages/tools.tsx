import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import ParticleFlowBackground from '@/components/particle-flow-background';
import Base64Tool from '@/components/tools/base64-tool';
import Identifiers from '@/components/tools/identifiers';
import JsonFormatter from '@/components/tools/json-formatter';
import PhpToJson from '@/components/tools/php-to-json';
import { cn } from '@/lib/utils';

const tools = [
    { key: 'json', label: 'JSON formatter', component: JsonFormatter },
    { key: 'php', label: 'PHP → JSON', component: PhpToJson },
    { key: 'base64', label: 'Base64', component: Base64Tool },
    { key: 'ids', label: 'PESEL & NIP', component: Identifiers },
];

export default function Tools() {
    const [active, setActive] = useState(tools[0].key);

    return (
        <>
            <Head title="Tools" />
            <ParticleFlowBackground />
            <div className="relative min-h-screen text-foreground">
                <header className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-6">
                            <h1 className="text-lg font-semibold tracking-wide">
                                PIW Devtools
                            </h1>
                            <nav className="flex flex-wrap gap-1">
                                {tools.map((tool) => (
                                    <button
                                        key={tool.key}
                                        type="button"
                                        onClick={() => setActive(tool.key)}
                                        aria-current={
                                            active === tool.key
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(
                                            'rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                                            active === tool.key &&
                                                'bg-accent font-medium',
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
                    <div className="rounded-xl border bg-background/75 p-4 shadow-lg shadow-fuchsia-500/5 backdrop-blur-md sm:p-6 dark:shadow-cyan-500/10">
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
