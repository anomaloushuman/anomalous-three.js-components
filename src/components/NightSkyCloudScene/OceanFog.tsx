import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { computeHorizonNdcY, setResolutionFromGl } from './horizonClip';
import { introOceanMix, getIntroProgress } from './introState';
import { FOG_COLOR_RGB, OCEAN_CENTER, OCEAN_DEPTH, OCEAN_WIDTH } from './sceneConstants';

const fogVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fogFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uHorizonNdcY;
  uniform vec3 uFogColor;
  uniform float uIntroReveal;

  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amp * noise(p);
      p *= 2.03;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    float fragNdcY = (gl_FragCoord.y / uResolution.y) * 2.0 - 1.0;

    float horizonBand = smoothstep(uHorizonNdcY + 0.05, uHorizonNdcY - 0.01, fragNdcY);
    horizonBand *= smoothstep(uHorizonNdcY - 0.09, uHorizonNdcY + 0.01, fragNdcY);
    if (horizonBand < 0.01) discard;

    float dist = length(vWorldPosition.xz - cameraPosition.xz);
    float distFade = smoothstep(90.0, 280.0, dist);
    if (distFade < 0.01) discard;

    vec2 drift = vec2(uTime * 0.01, uTime * 0.006);
    float wisp = fbm(vWorldPosition.xz * 0.004 + drift);
    float wispMask = smoothstep(0.25, 0.8, wisp);

    float alpha = horizonBand * distFade * wispMask * 0.16 * uIntroReveal;
    if (alpha < 0.008) discard;

    gl_FragColor = vec4(uFogColor, alpha);
  }
`;

function buildUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uHorizonNdcY: { value: 0 },
    uFogColor: { value: new THREE.Vector3(...FOG_COLOR_RGB) },
    uIntroReveal: { value: 1 },
  };
}

export function OceanFog() {
  const uniforms = useMemo(() => buildUniforms(), []);
  const { camera, gl } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fogVertexShader,
        fragmentShader: fogFragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
      }),
    [uniforms],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    setResolutionFromGl(gl, uniforms.uResolution.value);
    uniforms.uHorizonNdcY.value = computeHorizonNdcY(camera);
    uniforms.uIntroReveal.value = introOceanMix(getIntroProgress());
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[OCEAN_CENTER[0], 0.15, OCEAN_CENTER[2]]}
      renderOrder={3}
      frustumCulled={false}
    >
      <planeGeometry args={[OCEAN_WIDTH, OCEAN_DEPTH, 1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
