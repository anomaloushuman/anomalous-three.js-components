import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { MeshPhysicalMaterial } from 'three';
import { cloneGlassPiece, createGlassMaterial, MODEL_URLS, type ChessKind } from './chessModels';

interface ChessPieceProps {
  kind: ChessKind;
  material?: MeshPhysicalMaterial;
}

export function ChessPiece({ kind, material }: ChessPieceProps) {
  const { scene } = useGLTF(MODEL_URLS[kind]);
  const glass = useMemo(() => material ?? createGlassMaterial(), [material]);

  const piece = useMemo(() => cloneGlassPiece(kind, scene, glass), [kind, scene, glass]);

  return <primitive object={piece} />;
}

export type { ChessKind } from './chessModels';
