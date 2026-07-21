import { useMemo } from 'react';
import * as THREE from 'three';
import { HORIZON_SKY_RGB } from '../NightSkyCloudScene/sceneConstants';
import { OCEAN_COLOR_RGB } from '../NightSkyCloudScene/types';

const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uAccent;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y;

    vec3 sky = mix(uHorizon, uMid, smoothstep(-0.2, 0.05, h));
    sky = mix(sky, uZenith, smoothstep(0.0, 0.85, h));

    // Soft ocean-blue horizon wash — matches NightSkyCloudScene
    float rim = pow(1.0 - abs(h), 2.8) * 0.22;
    sky += uAccent * rim;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

/** Night sky dome tuned to the shared ocean / fog palette */
export function CyberSky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uZenith: { value: new THREE.Color(0.004, 0.008, 0.035) },
          uMid: { value: new THREE.Color(0.01, 0.024, 0.085) },
          uHorizon: { value: new THREE.Color(...HORIZON_SKY_RGB) },
          uAccent: { value: new THREE.Color(...OCEAN_COLOR_RGB) },
        },
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[400, 48, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
