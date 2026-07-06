/** WebKit Safari (not Chrome/Chromium on macOS). */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isWebKit = /AppleWebKit/i.test(ua);
  const isChromium = /Chrome|Chromium|Edg|OPR|CriOS/i.test(ua);
  return isWebKit && !isChromium;
}

/** Safari struggles with CSS opacity on WebGL canvases and low exposure ramps. */
export function prefersShaderOnlyIntro(): boolean {
  return isSafari();
}
