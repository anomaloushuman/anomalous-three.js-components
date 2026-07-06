import * as THREE from 'three';

/** Jet stream core altitude band (scene units) */
const JET_STREAM_CORE_Y = 7;

/** Predominantly west-to-east flow with slight southward bias */
const WIND_AXIS = new THREE.Vector3(1, 0, 0.12).normalize();

/** Base eastward speed in scene units/sec (~scaled from ~120 kt jet stream) */
const BASE_SPEED = 2.8;

const _wind = new THREE.Vector3();

/**
 * Sample jet-stream wind at a world position.
 * Models meandering Rossby-wave flow, altitude shear, and turbulent gusts.
 */
export function sampleJetStreamWind(position: THREE.Vector3, time: number): THREE.Vector3 {
  const { x, y, z } = position;

  // Rossby-wave meander — jet stream snakes north/south as it flows east
  const meander =
    Math.sin(z * 0.07 + time * 0.11) * 1.4 +
    Math.sin(z * 0.14 - time * 0.06) * 0.7 +
    Math.cos(x * 0.04 + time * 0.08) * 0.5;

  // Altitude shear — strongest near jet stream core, weaker above/below
  const altitudeShear = Math.exp(-Math.pow((y - JET_STREAM_CORE_Y) / 3.5, 2));
  const speed = BASE_SPEED * (0.45 + altitudeShear * 0.55);

  _wind.copy(WIND_AXIS).multiplyScalar(speed);
  _wind.z += meander * 0.4;

  // Turbulent gusts and vertical shear eddies
  _wind.x += Math.sin(x * 0.25 + time * 0.45) * 0.18;
  _wind.y += Math.sin(time * 0.3 + z * 0.12) * 0.06 * altitudeShear;
  _wind.z += Math.cos(x * 0.18 + time * 0.38) * 0.14;

  return _wind;
}

/** Gentle buoyancy oscillation independent of horizontal wind */
export function sampleBuoyancy(time: number, phase: number): number {
  return (
    Math.sin(time * 0.2 + phase) * 0.3 +
    Math.sin(time * 0.13 + phase * 1.7) * 0.15
  );
}

/** Wind-driven roll/pitch for clouds riding the stream */
export function sampleWindTilt(wind: THREE.Vector3): { pitch: number; roll: number; yaw: number } {
  return {
    yaw: Math.atan2(wind.z, wind.x) * 0.12,
    pitch: wind.y * 0.04,
    roll: wind.z * 0.03,
  };
}