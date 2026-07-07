import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function DataCenterSceneEffects() {
  return (
    <>
      <Environment preset="night" environmentIntensity={0.45} />
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.52}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.68}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.48} />
      </EffectComposer>
    </>
  );
}
