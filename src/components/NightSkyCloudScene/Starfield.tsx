import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { computeHorizonNdcY, setResolutionFromGl } from './horizonClip';
import { introStarsMix, getIntroProgress } from './introState';
import type { ParallaxState } from './types';
import { HORIZON_Y } from './sceneConstants';

interface StarfieldProps {
  count?: number;
  parallax?: ParallaxState | null;
  parallaxStrength?: number;
}

const starVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aTwinkleSpeed;
  attribute float aTwinkleOffset;

  varying float vBrightness;
  varying float vTwinkleSpeed;
  varying float vTwinkleOffset;
  varying float vWorldY;

  void main() {
    vBrightness = aBrightness;
    vTwinkleSpeed = aTwinkleSpeed;
    vTwinkleOffset = aTwinkleOffset;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldY = worldPos.y;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (520.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = /* glsl */ `
  varying float vBrightness;
  varying float vTwinkleSpeed;
  varying float vTwinkleOffset;
  varying float vWorldY;

  uniform float uTime;
  uniform float uHorizonY;
  uniform vec2 uResolution;
  uniform float uHorizonNdcY;
  uniform float uIntroReveal;

  void main() {
    if (vWorldY < uHorizonY) discard;

    // Match ocean horizon clip — Safari renders transparent points after opaque meshes
    float fragNdcY = (gl_FragCoord.y / uResolution.y) * 2.0 - 1.0;
    if (fragNdcY < uHorizonNdcY + 0.01) discard;

    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = smoothstep(0.2, 0.0, dist);
    float glow = smoothstep(0.5, 0.1, dist);
    float twinkle = 0.75 + 0.25 * sin(uTime * vTwinkleSpeed + vTwinkleOffset);
    float alpha = (core * 1.4 + glow * 0.5) * vBrightness * twinkle;

    vec3 white = vec3(0.95, 0.97, 1.0);
    vec3 color = white * (0.65 + vBrightness * 0.3) * uIntroReveal;
    gl_FragColor = vec4(color, alpha * 0.85);
  }
`;

function createStarLayer(count: number, radiusMin: number, radiusMax: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brightness = new Float32Array(count);
  const twinkleSpeed = new Float32Array(count);
  const twinkleOffset = new Float32Array(count);

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 20;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = radiusMin + Math.random() * (radiusMax - radiusMin);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    // Upper sky only — world Y and minimum elevation above the horizon plane
    const elevation = y / radius;
    if (y < HORIZON_Y + 2 || elevation < 0.28) continue;

    positions[placed * 3] = x;
    positions[placed * 3 + 1] = y;
    positions[placed * 3 + 2] = z;

    const roll = Math.random();
    sizes[placed] = roll < 0.92 ? 1.2 + Math.random() * 2.0 : 2.5 + Math.random() * 3.0;
    brightness[placed] = roll < 0.92 ? 0.35 + Math.random() * 0.3 : 0.55 + Math.random() * 0.15;
    twinkleSpeed[placed] = 0.4 + Math.random() * 1.8;
    twinkleOffset[placed] = Math.random() * Math.PI * 2;
    placed++;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
  geometry.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeed, 1));
  geometry.setAttribute('aTwinkleOffset', new THREE.BufferAttribute(twinkleOffset, 1));

  return geometry;
}

function StarLayer({
  geometry,
  parallax,
  parallaxStrength,
  depth,
}: {
  geometry: THREE.BufferGeometry;
  parallax: ParallaxState | null;
  parallaxStrength: number;
  depth: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, gl } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uHorizonY: { value: HORIZON_Y },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uHorizonNdcY: { value: 0 },
          uIntroReveal: { value: 1 },
        },
        transparent: true,
        depthWrite: true,
        depthTest: true,
        alphaTest: 0.04,
        blending: THREE.NormalBlending,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    setResolutionFromGl(gl, material.uniforms.uResolution.value);
    material.uniforms.uHorizonNdcY.value = computeHorizonNdcY(camera);
    material.uniforms.uIntroReveal.value = introStarsMix(getIntroProgress());

    if (!pointsRef.current || !parallax) return;

    const strength = parallaxStrength * depth;
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      parallax.target.x * strength,
      0.04,
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      parallax.target.y * strength,
      0.04,
    );
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={0} />
  );
}

export function Starfield({
  count = 2000,
  parallax = null,
  parallaxStrength = 0.2,
}: StarfieldProps) {
  const distantStars = useMemo(
    () => createStarLayer(Math.floor(count * 0.85), 90, 140),
    [count],
  );
  const brightStars = useMemo(
    () => createStarLayer(Math.floor(count * 0.15), 70, 110),
    [count],
  );

  return (
    <>
      <StarLayer
        geometry={distantStars}
        parallax={parallax}
        parallaxStrength={parallaxStrength}
        depth={0.6}
      />
      <StarLayer
        geometry={brightStars}
        parallax={parallax}
        parallaxStrength={parallaxStrength}
        depth={1.0}
      />
    </>
  );
}
