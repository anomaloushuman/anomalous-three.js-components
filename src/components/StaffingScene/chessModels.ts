import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PIECE_FOOTPRINT } from './gridConstants';

export type ChessKind = 'pawn' | 'rook' | 'bishop' | 'knight';

export const CHESS_KINDS: ChessKind[] = ['pawn', 'rook', 'bishop', 'knight'];

export const MODEL_URLS: Record<ChessKind, string> = {
  pawn: new URL('./models/pawn.glb', import.meta.url).href,
  rook: new URL('./models/rook.glb', import.meta.url).href,
  bishop: new URL('./models/bishop.glb', import.meta.url).href,
  knight: new URL('./models/knight.glb', import.meta.url).href,
};

const TARGET_GRID_FOOTPRINT = PIECE_FOOTPRINT;
const preparedTemplates = new Map<ChessKind, THREE.Object3D>();

/** Normalize GLB orientation and scale each piece to a consistent grid footprint. */
export function prepareChessPiece(root: THREE.Object3D, targetFootprint = TARGET_GRID_FOOTPRINT): THREE.Object3D {
  const piece = root.clone(true);

  // Authored chess GLBs are Z-up; Three.js scenes use Y-up.
  piece.rotation.x = -Math.PI / 2;
  piece.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(piece);
  const size = box.getSize(new THREE.Vector3());
  const footprint = Math.max(size.x, size.z, 1e-6);
  const scale = targetFootprint / footprint;

  piece.scale.setScalar(scale);
  piece.updateMatrixWorld(true);

  const fitted = new THREE.Box3().setFromObject(piece);
  const center = fitted.getCenter(new THREE.Vector3());
  piece.position.set(-center.x, -fitted.min.y, -center.z);

  return piece;
}

export function getPreparedTemplate(kind: ChessKind, source: THREE.Object3D): THREE.Object3D {
  const cached = preparedTemplates.get(kind);
  if (cached) return cached;

  const prepared = prepareChessPiece(source);
  preparedTemplates.set(kind, prepared);
  return prepared;
}

export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#9ec4ff',
    emissive: '#1b3f93',
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.48,
    transmission: 0.88,
    thickness: 0.95,
    roughness: 0.08,
    metalness: 0,
    ior: 1.46,
    reflectivity: 0.55,
    clearcoat: 0.18,
    clearcoatRoughness: 0.14,
    attenuationDistance: 2.8,
    attenuationColor: new THREE.Color('#87aef3'),
    envMapIntensity: 1.05,
    depthWrite: false,
    depthTest: true,
  });
}

export function cloneGlassPiece(
  kind: ChessKind,
  source: THREE.Object3D,
  material: THREE.MeshPhysicalMaterial,
): THREE.Object3D {
  const clone = getPreparedTemplate(kind, source).clone(true);
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
  return clone;
}

for (const url of Object.values(MODEL_URLS)) {
  useGLTF.preload(url);
}
