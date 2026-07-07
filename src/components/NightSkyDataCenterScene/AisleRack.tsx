import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RACK_DEPTH, RACK_HEIGHT, RACK_WIDTH } from './dataCenterConstants';

const FACE_TIME_SCALE = 0.18;

const faceVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const faceFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uSeed;

  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    float units = 14.0;
    float row = floor(vUv.y * units);
    float rowFrac = fract(vUv.y * units);

    float h = hash(uSeed * 0.17 + row * 3.1);
    float lit = step(0.38, h);
    float led = step(0.62, h) * step(rowFrac, 0.55) * step(0.15, rowFrac);

    float pulse = 0.9 + 0.1 * sin(uTime * (0.35 + h * 0.5) + uSeed);

    vec3 base = mix(vec3(0.09, 0.13, 0.21), vec3(0.13, 0.19, 0.28), lit);
    base += vec3(0.03, 0.08, 0.14) * lit * 0.12 * pulse;

    vec3 ledCol = h > 0.82 ? vec3(0.55, 0.4, 0.12) : (h > 0.72 ? vec3(0.18, 0.45, 0.24) : vec3(0.15, 0.38, 0.52));
    base += ledCol * led * 0.35 * pulse;

    gl_FragColor = vec4(base, uReveal);
  }
`;

interface AisleRackProps {
  position: [number, number, number];
  seed: number;
  introReveal: number;
}

const POST_MAT = { color: '#2a3548' };
const BODY_MAT = { color: '#141c2a' };

/** Matte shader rack — no trim borders, no specular */
export function AisleRack({ position, seed, introReveal }: AisleRackProps) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: introReveal },
      uSeed: { value: seed },
    }),
    [introReveal, seed],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime * FACE_TIME_SCALE;
    uniforms.uReveal.value = introReveal;
  });

  const hw = RACK_WIDTH / 2;
  const hd = RACK_DEPTH / 2;

  return (
    <group position={position}>
      {(
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ] as [number, number][]
      ).map(([sx, sz], i) => (
        <mesh key={i} position={[sx * hw, RACK_HEIGHT / 2, sz * hd]}>
          <boxGeometry args={[0.08, RACK_HEIGHT, 0.08]} />
          <meshLambertMaterial {...POST_MAT} />
        </mesh>
      ))}

      <mesh position={[0, RACK_HEIGHT / 2, 0]}>
        <boxGeometry args={[RACK_WIDTH - 0.14, RACK_HEIGHT - 0.06, RACK_DEPTH - 0.12]} />
        <meshLambertMaterial {...BODY_MAT} />
      </mesh>

      <mesh position={[0, RACK_HEIGHT / 2, hd - 0.02]}>
        <planeGeometry args={[RACK_WIDTH - 0.12, RACK_HEIGHT - 0.08]} />
        <shaderMaterial
          vertexShader={faceVertexShader}
          fragmentShader={faceFragmentShader}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
