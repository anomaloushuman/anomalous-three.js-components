import { useMemo } from 'react';
import * as THREE from 'three';
import { OCEAN_COLOR_RGB } from './types';

const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y;

    // Deep night sky — clearly darker than ocean blue
    vec3 zenith = vec3(0.004, 0.008, 0.035);
    vec3 upper = vec3(0.006, 0.014, 0.055);
    vec3 mid = vec3(0.01, 0.024, 0.085);
    vec3 horizon = vec3(0.016, 0.035, 0.11);

    vec3 sky = mix(horizon, mid, smoothstep(-0.2, 0.05, h));
    sky = mix(sky, upper, smoothstep(0.0, 0.45, h));
    sky = mix(sky, zenith, smoothstep(0.25, 0.9, h));

    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[250, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** Soft horizon glow band where sky meets the ocean */
export function HorizonGlow() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTopColor: { value: new THREE.Color(0.015, 0.04, 0.1) },
          uBottomColor: { value: new THREE.Color(...OCEAN_COLOR_RGB).multiplyScalar(0.35) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTopColor;
          uniform vec3 uBottomColor;
          varying vec2 vUv;
          void main() {
            float a = smoothstep(0.0, 1.0, 1.0 - vUv.y) * 0.55;
            vec3 col = mix(uTopColor, uBottomColor, vUv.y);
            gl_FragColor = vec4(col, a);
          }
        `,
      }),
    [],
  );

  return (
    <mesh position={[0, 4, -130]} renderOrder={-5}>
      <planeGeometry args={[500, 40]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
