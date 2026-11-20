import { useEffect, useRef } from 'react';

/** Characters the tools actually chew through: JSON punctuation, digits, base64. */
const characters = '{}[]:",01=/+QWxyz9a'.split('');
const strandCount = 14;
const glyphCount = 1300;
/** Depth at which one world unit is one CSS pixel; nearer is bigger, farther is smaller. */
const focalDepth = 900;
/** Glyphs closer than this are dropped instead of blowing up in size. */
const nearClip = 260;
/** Every glyph is drawn at this size and scaled by the transform, so sizes change smoothly. */
const baseFontSize = 13;
/** Repeats green as the leading stream colour; the others add contrast. */
const strandColors = ['--glyph-a', '--glyph-b', '--glyph-a', '--glyph-c'];

type Strand = {
    y: number;
    z: number;
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
    /** Projection from the current frame, kept on the glyph to avoid allocating per frame. */
    screenX: number;
    screenY: number;
    scale: number;
    depth: number;
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
        let ratio = 1;
        let strands: Strand[] = [];
        let glyphs: Glyph[] = [];
        /** Half the width of the world the streams flow through, wide enough for near streams to fill the screen. */
        let span = 0;
        let frame = 0;
        let last = performance.now();
        /** Glyphs visible this frame, reused between frames. */
        const visible: Glyph[] = [];
        /** Theme values, read when the theme changes rather than every frame. */
        const theme = {
            colors: {} as Record<string, string>,
            strength: 1,
            font: '',
        };

        const readTheme = () => {
            const styles = getComputedStyle(document.documentElement);
            theme.colors = Object.fromEntries(
                strandColors.map((name) => [
                    name,
                    styles.getPropertyValue(name),
                ]),
            );
            theme.strength =
                Number(styles.getPropertyValue('--glyph-alpha')) || 1;
            theme.font = `${baseFontSize}px ${styles.getPropertyValue('--font-mono') || 'monospace'}`;
        };

        const resize = () => {
            ratio = Math.min(window.devicePixelRatio, 1.5);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            span = width * 0.75;
            strands = Array.from({ length: strandCount }, (_, i) => ({
                // World y is centred on the screen middle; deeper streams spread wider to fill the frame.
                y: ((i + 0.5) / strandCount - 0.5) * height * 1.3,
                z: focalDepth + (Math.random() - 0.35) * 700,
                amplitude: 20 + Math.random() * 50,
                frequency: 0.002 + Math.random() * 0.003,
                phase: Math.random() * 6,
                speed: 18 + Math.random() * 30,
                color: strandColors[i % strandColors.length],
            }));
            glyphs = Array.from({ length: glyphCount }, () => ({
                strand: Math.floor(Math.random() * strandCount),
                x: (Math.random() * 2 - 1) * span,
                character: randomCharacter(),
                alpha: 0.25 + Math.random() * 0.75,
                size: 11 + Math.floor(Math.random() * 3) * 2,
                screenX: 0,
                screenY: 0,
                scale: 0,
                depth: 0,
            }));
        };

        const draw = (seconds: number, delta: number) => {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = theme.font;

            // A slow camera sway around the scene centre gives near and far streams parallax.
            const yaw = Math.sin(seconds * 0.045) * 0.32;
            const pitch = Math.sin(seconds * 0.031 + 1) * 0.1;
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);
            visible.length = 0;

            for (const glyph of glyphs) {
                const strand = strands[glyph.strand];
                glyph.x += strand.speed * delta;

                if (glyph.x > span) {
                    glyph.x = -span;
                    glyph.character = randomCharacter();
                }

                const worldY =
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
                const worldZ =
                    strand.z -
                    focalDepth +
                    Math.cos(glyph.x * strand.frequency * 0.8 + strand.phase) *
                        strand.amplitude;

                const rotatedX = glyph.x * cosYaw - worldZ * sinYaw;
                const turnedZ = glyph.x * sinYaw + worldZ * cosYaw;
                const rotatedY = worldY * cosPitch - turnedZ * sinPitch;
                const depth =
                    worldY * sinPitch + turnedZ * cosPitch + focalDepth;

                if (depth < nearClip) {
                    continue;
                }

                const scale = focalDepth / depth;
                const x = width / 2 + rotatedX * scale;
                const y = height / 2 + rotatedY * scale;

                if (x < -40 || x > width + 40 || y < -40 || y > height + 40) {
                    continue;
                }

                glyph.screenX = x;
                glyph.screenY = y;
                glyph.scale = scale;
                glyph.depth = depth;
                visible.push(glyph);
            }

            // Painter's order: far glyphs first so near ones sit on top.
            visible.sort((a, b) => b.depth - a.depth);
            let currentColor = '';

            for (const glyph of visible) {
                const x = glyph.screenX;
                const edgeFade = Math.min(1, x / 120, (width - x) / 120);
                // Far glyphs fade into the background like fog; near ones stay crisp.
                const fog = Math.min(
                    1,
                    Math.max(0, 2 - glyph.depth / focalDepth),
                );
                // Continuous scale (never rounded to whole font sizes), capped so near glyphs stay calm.
                const size =
                    Math.min(30, Math.max(6, glyph.size * glyph.scale)) /
                    baseFontSize;
                const color = theme.colors[strands[glyph.strand].color];

                if (color !== currentColor) {
                    currentColor = color;
                    context.fillStyle = color;
                }

                // Canvas ignores alpha above 1, so clamp: a strength above 1 lifts faint glyphs.
                context.globalAlpha = Math.min(
                    1,
                    Math.max(0, edgeFade) * glyph.alpha * fog * theme.strength,
                );
                context.setTransform(
                    size * ratio,
                    0,
                    0,
                    size * ratio,
                    x * ratio,
                    glyph.screenY * ratio,
                );
                context.fillText(glyph.character, 0, 0);
            }

            context.globalAlpha = 1;
        };

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            // Every display frame with the real time step: a frame cap judders on 120/144 Hz screens.
            draw(now / 1000, Math.min((now - last) / 1000, 0.1));
            last = now;
        };

        const onResize = () => {
            resize();
            draw(last / 1000, 0);
        };

        readTheme();
        resize();
        window.addEventListener('resize', onResize);

        if (reducedMotion) {
            draw(last / 1000, 0);
            const observer = new MutationObserver(() => {
                readTheme();
                draw(last / 1000, 0);
            });
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => {
                observer.disconnect();
                window.removeEventListener('resize', onResize);
            };
        }

        const themeObserver = new MutationObserver(readTheme);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

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
            themeObserver.disconnect();
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
