/** Shared scene layout — high-altitude night view over open ocean */

/** World Y of the ocean surface */
export const OCEAN_Y = 0;

/** Stars / sky only above this world Y */
export const HORIZON_Y = 8;

/** Camera defaults — elevated, nearly level gaze over the horizon */
export const CAMERA_POS: [number, number, number] = [0, 18, 10];
export const CAMERA_LOOK_AT: [number, number, number] = [0, 11, -80];
export const CAMERA_FOV = 42;

/** Must exceed camera-to-far-ocean distance (~400+) to avoid horizon clipping */
export const CAMERA_FAR = 2500;

/** Ocean mesh — large enough to fill the frustum at the horizon */
export const OCEAN_WIDTH = 4000;
export const OCEAN_DEPTH = 2400;

/** Ocean mesh center — fully in front of camera (z < camera.z) */
export const OCEAN_CENTER: [number, number, number] = [0, OCEAN_Y, -200];

/** Sky dome horizon tone — must match SkyDome shader for seamless blend */
export const HORIZON_SKY_RGB: [number, number, number] = [0.016, 0.035, 0.11];

/** Night horizon fog — matches sky dome horizon tone */
export const FOG_COLOR_RGB: [number, number, number] = [0.012, 0.028, 0.075];
