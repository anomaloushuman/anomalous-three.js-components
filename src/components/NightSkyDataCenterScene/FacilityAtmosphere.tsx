import { GRID_BACK_Z } from './dataCenterConstants';

interface FacilityAtmosphereProps {
  introReveal: number;
}

/** Soft flat fill — no specular hotspots on rack faces */
export function FacilityAtmosphere({ introReveal }: FacilityAtmosphereProps) {
  return (
    <group>
      <ambientLight intensity={0.38 * introReveal} color="#a0b0c8" />
      <hemisphereLight args={['#506888', '#101820', 0.28 * introReveal]} />
      <directionalLight position={[0, 8, 4]} intensity={0.18 * introReveal} color="#c0d0e8" />
      <directionalLight position={[0, 4, GRID_BACK_Z]} intensity={0.08 * introReveal} color="#8098b8" />
    </group>
  );
}
