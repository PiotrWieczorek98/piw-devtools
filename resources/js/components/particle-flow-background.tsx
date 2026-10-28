import { useEffect, useRef } from 'react';

const FOV = Math.PI / 4;

export const particleFlowDefaults = {
    /** Number of streams flowing through the scene. */
    strands: 100,
    /** Particles along each stream. */
    particlesPerStrand: 300,
    /** Loose particles drifting between the streams. */
    dust: 6000,
    /** How thick each stream is, in world units. */
    strandThickness: 0.5,
    /** Multiplier for particle size. */
    particleSize: 1,
    /** Largest a particle may get on screen, in pixels. */
    maxParticleSize: 30,
    /** Overall particle opacity, 0–1+. */
    opacity: 1,
    /** Multiplier for how fast everything flows. */
    speed: 1,
    /** How much the streams twist and curl. */
    turbulence: 1,
    /** Brightness of the light pulses racing along streams, 0 disables them. */
    pulse: 1,
    /** How much each particle flickers, 0–1. */
    twinkle: 0.4,
    /** Stream colours, blended across the scene. */
    colorA: '#00d9ff',
    colorB: '#ff26d9',
    /** Strength of the swirl the pointer stirs up, 0 disables it. */
    pointerInfluence: 1,
    /** Distance from the camera to the centre of the scene. */
    cameraDistance: 38,
    /** Radians per second the camera orbits. */
    orbitSpeed: 0.025,
};

export type ParticleFlowSettings = typeof particleFlowDefaults;

const glFloat = (value: number) => value.toFixed(4);

const glColor = (hex: string) =>
    `vec3(${[1, 3, 5].map((i) => glFloat(parseInt(hex.slice(i, i + 2), 16) / 255)).join(', ')})`;

const vertexShader = (settings: ParticleFlowSettings) => `#version 300 es
in vec4 aSeed;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uPixelRatio;
uniform vec3 uVortex;
uniform float uVortexStrength;
out float vAlpha;
out float vGlow;
out float vHue;

void main() {
    float life = fract(uTime * (0.035 + fract(aSeed.w * 13.7) * 0.02) + aSeed.w);
    vec3 p = aSeed.xyz;
    p.x += (life - 0.5) * 70.0;

    float t = uTime * 0.25;
    float amplitude = ${glFloat(5 * settings.turbulence)};
    float frequency = 0.07;
    for (int i = 0; i < 4; i++) {
        p += amplitude * vec3(
            sin(p.y * frequency + t) * 0.4,
            sin(p.z * frequency * 1.3 + p.x * frequency + t * 0.8),
            cos(p.x * frequency * 0.9 - t * 1.1)
        );
        frequency *= 1.9;
        amplitude *= 0.48;
        t *= 1.4;
    }

    vec3 toVortex = p - uVortex;
    float pull = exp(-dot(toVortex, toVortex) * 0.015) * uVortexStrength * ${glFloat(settings.pointerInfluence)};
    float angle = pull * 2.2;
    toVortex.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * toVortex.xz;
    p = uVortex + toVortex * (1.0 + pull * 0.35);

    vec4 view = uView * vec4(p, 1.0);
    gl_Position = uProj * view;
    float depth = -view.z;

    vGlow = ${glFloat(settings.pulse)} * pow(0.5 + 0.5 * sin(life * 55.0 - uTime * 3.0 + aSeed.y * 2.0), 10.0);
    float twinkle = ${glFloat(1 - settings.twinkle)} + ${glFloat(settings.twinkle)} * sin(uTime * (2.0 + fract(aSeed.w * 91.0) * 4.0) + aSeed.w * 50.0);
    vAlpha = sin(life * 3.14159) * twinkle * (1.0 - smoothstep(40.0, 75.0, depth)) * (1.0 - pull * 0.3);
    vHue = 0.5 + 0.5 * sin(p.y * 0.25 + p.x * 0.03 + uTime * 0.2);
    gl_PointSize = clamp((1.2 + vGlow * 2.5 + pull * 2.0) * uPixelRatio * ${glFloat(22 * settings.particleSize)} / depth, 1.0, ${glFloat(settings.maxParticleSize)});
}`;

const fragmentShader = (settings: ParticleFlowSettings) => `#version 300 es
precision highp float;
in float vAlpha;
in float vGlow;
in float vHue;
uniform float uDark;
out vec4 outColor;

void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float disc = exp(-r * r * 4.0) * (1.0 - step(1.0, r));
    vec3 neon = mix(${glColor(settings.colorA)}, ${glColor(settings.colorB)}, vHue);
    vec3 color = mix(neon, vec3(1.0), vGlow * 0.5 * uDark);
    color = mix(color * 0.65, color, uDark);
    outColor = vec4(color, disc * vAlpha * (0.55 + vGlow * 0.45) * ${glFloat(settings.opacity)});
}`;

type Vec3 = [number, number, number];

const subtract = (a: Vec3, b: Vec3): Vec3 => [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
];
const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => {
    const length = Math.hypot(...a);

    return [a[0] / length, a[1] / length, a[2] / length];
};
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function perspective(aspect: number): Float32Array {
    const f = 1 / Math.tan(FOV / 2);
    const near = 0.1;
    const far = 200;

    return new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far),
        0,
    ]);
}

function lookAt(eye: Vec3, target: Vec3) {
    const forward = normalize(subtract(target, eye));
    const right = normalize(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const matrix = new Float32Array([
        right[0],
        up[0],
        -forward[0],
        0,
        right[1],
        up[1],
        -forward[1],
        0,
        right[2],
        up[2],
        -forward[2],
        0,
        -dot(right, eye),
        -dot(up, eye),
        dot(forward, eye),
        1,
    ]);

    return { matrix, forward, right, up };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed');
    }

    return shader;
}

export default function ParticleFlowBackground(
    overrides: Partial<ParticleFlowSettings>,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const settingsKey = JSON.stringify({
        ...particleFlowDefaults,
        ...overrides,
    });

    useEffect(() => {
        const settings: ParticleFlowSettings = JSON.parse(settingsKey);
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl2', {
            antialias: false,
            premultipliedAlpha: false,
        });

        if (!canvas || !gl) {
            return;
        }

        const program = gl.createProgram();
        gl.attachShader(
            program,
            compile(gl, gl.VERTEX_SHADER, vertexShader(settings)),
        );
        gl.attachShader(
            program,
            compile(gl, gl.FRAGMENT_SHADER, fragmentShader(settings)),
        );
        gl.linkProgram(program);
        gl.useProgram(program);

        const seeds: number[] = [];

        for (let strand = 0; strand < settings.strands; strand++) {
            const y = (Math.random() - 0.5) * 14;
            const z = (Math.random() - 0.5) * 40;

            for (let i = 0; i < settings.particlesPerStrand; i++) {
                seeds.push(
                    0,
                    y + (Math.random() - 0.5) * settings.strandThickness,
                    z + (Math.random() - 0.5) * settings.strandThickness,
                    Math.random(),
                );
            }
        }

        for (let i = 0; i < settings.dust; i++) {
            seeds.push(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 24,
                (Math.random() - 0.5) * 50,
                Math.random(),
            );
        }

        const particleCount = seeds.length / 4;

        gl.bindVertexArray(gl.createVertexArray());
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seeds), gl.STATIC_DRAW);
        const seedLocation = gl.getAttribLocation(program, 'aSeed');
        gl.enableVertexAttribArray(seedLocation);
        gl.vertexAttribPointer(seedLocation, 4, gl.FLOAT, false, 0, 0);

        const uniform = (name: string) => gl.getUniformLocation(program, name);
        const uniforms = {
            proj: uniform('uProj'),
            view: uniform('uView'),
            time: uniform('uTime'),
            pixelRatio: uniform('uPixelRatio'),
            vortex: uniform('uVortex'),
            vortexStrength: uniform('uVortexStrength'),
            dark: uniform('uDark'),
        };

        gl.enable(gl.BLEND);
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const pointer = { x: 0, y: 0, active: false };
        const eased = { x: 0, y: 0 };
        const vortex = { x: 0, z: 0, strength: 0 };
        let aspect = 1;
        let frame = 0;
        let last = performance.now();

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio, 1.5);
            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            aspect = window.innerWidth / window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniformMatrix4fv(uniforms.proj, false, perspective(aspect));
            gl.uniform1f(uniforms.pixelRatio, ratio);
        };

        const render = (now: number) => {
            const delta = Math.min((now - last) / 1000, 0.1);
            last = now;
            const seconds = now / 1000;

            eased.x += (pointer.x - eased.x) * delta * 1.5;
            eased.y += (pointer.y - eased.y) * delta * 1.5;

            const yaw = seconds * settings.orbitSpeed + eased.x * 0.25;
            const eye: Vec3 = [
                Math.sin(yaw) * settings.cameraDistance,
                9 + eased.y * 4,
                Math.cos(yaw) * settings.cameraDistance,
            ];
            const camera = lookAt(eye, [0, 0, 0]);

            if (pointer.active) {
                const scale = Math.tan(FOV / 2);
                const direction = normalize([
                    camera.forward[0] +
                        (camera.right[0] * pointer.x * aspect +
                            camera.up[0] * pointer.y) *
                            scale,
                    camera.forward[1] +
                        (camera.right[1] * pointer.x * aspect +
                            camera.up[1] * pointer.y) *
                            scale,
                    camera.forward[2] +
                        (camera.right[2] * pointer.x * aspect +
                            camera.up[2] * pointer.y) *
                            scale,
                ]);

                if (direction[1] < 0) {
                    const t = -eye[1] / direction[1];
                    vortex.x +=
                        (eye[0] + direction[0] * t - vortex.x) * delta * 3;
                    vortex.z +=
                        (eye[2] + direction[2] * t - vortex.z) * delta * 3;
                }
            }

            vortex.strength +=
                ((pointer.active ? 1 : 0) - vortex.strength) * delta;

            const dark = document.documentElement.classList.contains('dark');
            const background: Vec3 = dark
                ? [6 / 255, 4 / 255, 18 / 255]
                : [250 / 255, 250 / 255, 1];

            gl.clearColor(...background, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.blendFunc(gl.SRC_ALPHA, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
            gl.uniformMatrix4fv(uniforms.view, false, camera.matrix);
            gl.uniform1f(uniforms.time, seconds * 0.6 * settings.speed);
            gl.uniform3f(uniforms.vortex, vortex.x, 0, vortex.z);
            gl.uniform1f(uniforms.vortexStrength, vortex.strength);
            gl.uniform1f(uniforms.dark, dark ? 1 : 0);
            gl.drawArrays(gl.POINTS, 0, particleCount);
        };

        const loop = (now: number) => {
            render(now);
            frame = requestAnimationFrame(loop);
        };

        const onPointerMove = (event: PointerEvent) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
            pointer.active = true;
        };

        const onPointerLeave = () => {
            pointer.active = false;
        };

        resize();
        window.addEventListener('resize', resize);

        if (reducedMotion) {
            render(last);
            const observer = new MutationObserver(() => render(last));
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => {
                observer.disconnect();
                window.removeEventListener('resize', resize);
            };
        }

        window.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerleave', onPointerLeave);
        frame = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [settingsKey]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 size-full bg-[#fafaff] dark:bg-[#060412]"
        />
    );
}
