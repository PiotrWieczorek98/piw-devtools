import { useEffect, useRef } from 'react';

/** Characters the tools actually chew through: JSON punctuation, digits, base64. */
const characters = '{}[]:",01=/+QWxyz9a'.split('');
const strandCount = 14;
const glyphCount = 520;
/** Repeats green as the leading stream colour; the others add contrast. */
const strandColors = ['--glyph-a', '--glyph-b', '--glyph-a', '--glyph-c'];
const frameInterval = 1000 / 30;

type Strand = {
    y: number;
    amplitude: number;
    frequency: number;
    phase: number;
    speed: number;
    color: string;
};
type Glyph = {
    strand: number;
    x: number;
    character: string;
    alpha: number;
    size: number;
};

const randomCharacter = () =>
    characters[Math.floor(Math.random() * characters.length)];

export default function GlyphStreamBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        let width = 0;
        let height = 0;
        let strands: Strand[] = [];
        let glyphs: Glyph[] = [];
        let frame = 0;
        let last = performance.now();
        let elapsed = 0;

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio, 1.5);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            strands = Array.from({ length: strandCount }, (_, i) => ({
                y: ((i + 0.5) / strandCount) * height,
                amplitude: 20 + Math.random() * 50,
                frequency: 0.002 + Math.random() * 0.003,
                phase: Math.random() * 6,
                speed: 18 + Math.random() * 30,
                color: strandColors[i % strandColors.length],
            }));
            glyphs = Array.from({ length: glyphCount }, () => ({
                strand: Math.floor(Math.random() * strandCount),
                x: Math.random() * width,
                character: randomCharacter(),
                alpha: 0.25 + Math.random() * 0.75,
                size: 11 + Math.floor(Math.random() * 3) * 2,
            }));
        };

        const draw = (seconds: number, delta: number) => {
            const styles = getComputedStyle(document.documentElement);
            const colors = Object.fromEntries(
                strandColors.map((name) => [
                    name,
                    styles.getPropertyValue(name),
                ]),
            );
            const strength =
                Number(styles.getPropertyValue('--glyph-alpha')) || 1;
            const font = styles.getPropertyValue('--font-mono') || 'monospace';

            context.clearRect(0, 0, width, height);
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            for (const glyph of glyphs) {
                const strand = strands[glyph.strand];
                glyph.x += strand.speed * delta;

                if (glyph.x > width + 20) {
                    glyph.x = -20;
                    glyph.character = randomCharacter();
                }

                const y =
                    strand.y +
                    Math.sin(
                        glyph.x * strand.frequency +
                            seconds * 0.3 +
                            strand.phase,
                    ) *
                        strand.amplitude +
                    Math.sin(glyph.x * strand.frequency * 2.7 + seconds * 0.2) *
                        strand.amplitude *
                        0.3;
                const edgeFade = Math.min(
                    1,
                    glyph.x / 120,
                    (width - glyph.x) / 120,
                );

                context.globalAlpha =
                    Math.max(0, edgeFade) * glyph.alpha * strength;
                context.fillStyle = colors[strand.color];
                context.font = `${glyph.size}px ${font}`;
                context.fillText(glyph.character, glyph.x, y);
            }

            context.globalAlpha = 1;
        };

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            elapsed += now - last;
            last = now;

            if (elapsed < frameInterval) {
                return;
            }

            draw(now / 1000, Math.min(elapsed / 1000, 0.1));
            elapsed = 0;
        };

        const onResize = () => {
            resize();
            draw(last / 1000, 0);
        };

        resize();
        window.addEventListener('resize', onResize);

        if (reducedMotion) {
            draw(last / 1000, 0);
            const observer = new MutationObserver(() => draw(last / 1000, 0));
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => {
                observer.disconnect();
                window.removeEventListener('resize', onResize);
            };
        }

        // Stop drawing while the tab is hidden; resume without a time jump.
        const onVisibilityChange = () => {
            cancelAnimationFrame(frame);

            if (!document.hidden) {
                last = performance.now();
                frame = requestAnimationFrame(loop);
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        frame = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 size-full bg-background"
        />
    );
}
