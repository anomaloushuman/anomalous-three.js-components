import * as THREE from 'three';
import { PEOPLE_COLOR, PEOPLE_EMISSIVE } from './types';

/** Floating badge body and emboss details */
export const badgeDiscGeometry = new THREE.CylinderGeometry(0.52, 0.52, 0.1, 52, 1, false);
export const badgeRimGeometry = new THREE.TorusGeometry(0.56, 0.032, 12, 44);
export const iconHeadGeometry = new THREE.SphereGeometry(0.12, 24, 20);
export const iconBodyGeometry = new THREE.SphereGeometry(0.21, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2);
export const iconPlateGeometry = new THREE.BoxGeometry(0.22, 0.035, 0.02);

/** Badge local placements */
export const BADGE_DEPTH = 0.06;
export const ICON_HEAD_Y = 0.09;
export const ICON_BODY_Y = -0.05;
export const ICON_PLATE_Y = -0.13;

export function createBodyMaterial() {
  return new THREE.MeshStandardMaterial({
    color: PEOPLE_COLOR,
    emissive: PEOPLE_EMISSIVE,
    emissiveIntensity: 0.3,
    roughness: 0.58,
    metalness: 0.08,
    envMapIntensity: 0.8,
    transparent: true,
    opacity: 1,
  });
}

export function createAccentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#b7ccff',
    emissive: '#86acff',
    emissiveIntensity: 0.2,
    roughness: 0.38,
    metalness: 0.16,
    envMapIntensity: 1.1,
    transparent: true,
    opacity: 1,
  });
}
