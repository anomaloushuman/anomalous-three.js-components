import { useMemo } from 'react';
import * as THREE from 'three';
import type { Dependency, Milestone, TaskBar, TaskStatus } from './types';
import {
  LANE_COLOR,
  TIMELINE_FAR,
  TIMELINE_NEAR,
  laneX,
  laneY,
  timelineZ,
} from './constants';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STATUSES: TaskStatus[] = ['done', 'active', 'planned', 'blocked'];

export function buildRoadmap(laneCount: number, taskCount: number) {
  const rand = seededRandom(42 + laneCount * 17 + taskCount);

  const tasks: TaskBar[] = [];
  for (let i = 0; i < taskCount; i++) {
    const lane = Math.floor(rand() * laneCount);
    const start = rand() * 0.72;
    const length = 0.06 + rand() * 0.16;
    let status: TaskStatus;
    if (start < 0.28) status = rand() > 0.15 ? 'done' : 'blocked';
    else if (start < 0.52) status = rand() > 0.35 ? 'active' : 'done';
    else status = rand() > 0.2 ? 'planned' : 'active';
    // Bias toward a readable mix
    if (i % 7 === 0) status = 'blocked';
    if (i % 5 === 0 && status === 'planned') status = 'active';

    tasks.push({
      id: i,
      lane,
      start: Math.min(start, 0.88),
      length: Math.min(length, 1 - start - 0.02),
      status: STATUSES.includes(status) ? status : 'planned',
      phase: rand() * Math.PI * 2,
      progress: status === 'done' ? 1 : status === 'active' ? 0.35 + rand() * 0.45 : status === 'blocked' ? 0.2 : 0,
    });
  }

  // Sort for stable dependency wiring
  tasks.sort((a, b) => a.start - b.start || a.lane - b.lane);
  tasks.forEach((t, i) => {
    t.id = i;
  });

  const milestones: Milestone[] = [];
  const milestoneTs = [0.18, 0.38, 0.58, 0.78];
  milestoneTs.forEach((t, i) => {
    milestones.push({
      id: i,
      t,
      lane: Math.floor(laneCount / 2) + ((i % 2 === 0 ? -1 : 1) * (i % 3 === 0 ? 0 : 1)),
      phase: rand() * Math.PI * 2,
      critical: i === 1 || i === 3,
    });
  });
  // Clamp lanes
  milestones.forEach((m) => {
    m.lane = Math.max(0, Math.min(laneCount - 1, m.lane));
  });

  const dependencies: Dependency[] = [];
  let depId = 0;
  for (let i = 0; i < tasks.length; i++) {
    const a = tasks[i];
    // Find a later task on a neighboring lane
    for (let j = i + 1; j < tasks.length; j++) {
      const b = tasks[j];
      if (b.start < a.start + a.length * 0.4) continue;
      if (Math.abs(b.lane - a.lane) > 2) continue;
      if (b.start > a.start + a.length + 0.22) break;
      if (rand() > 0.38) continue;
      dependencies.push({
        id: depId++,
        fromTask: a.id,
        toTask: b.id,
        critical: a.status === 'active' || b.status === 'active' || rand() > 0.7,
      });
      break;
    }
  }

  return { tasks, milestones, dependencies };
}

export function taskWorldPos(task: TaskBar, laneCount: number, along = 0.5) {
  const t = task.start + task.length * along;
  return new THREE.Vector3(laneX(task.lane, laneCount), laneY(task.lane, laneCount), timelineZ(t));
}

export function milestoneWorldPos(m: Milestone, laneCount: number) {
  return new THREE.Vector3(laneX(m.lane, laneCount), laneY(m.lane, laneCount) + 0.35, timelineZ(m.t));
}

export function makeLaneGeometry(laneCount: number): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let lane = 0; lane < laneCount; lane++) {
    const x = laneX(lane, laneCount);
    const y = laneY(lane, laneCount);
    positions.push(x, y, TIMELINE_NEAR, x, y, TIMELINE_FAR);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

export function makeArcCurve(
  from: THREE.Vector3,
  to: THREE.Vector3,
  lift = 1.4,
): THREE.CubicBezierCurve3 {
  const mid = from.clone().lerp(to, 0.5);
  mid.y += lift + Math.abs(to.z - from.z) * 0.012;
  const c1 = from.clone().lerp(mid, 0.55);
  const c2 = to.clone().lerp(mid, 0.55);
  return new THREE.CubicBezierCurve3(from, c1, c2, to);
}

export { LANE_COLOR };
