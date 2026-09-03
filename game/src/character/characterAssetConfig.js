export function mesh2MotionOptionsFromEnv(env = {}) {
  const modelUrl = String(env.VITE_CUMA_CHARACTER_URL ?? '').trim();
  if (!modelUrl) return null;

  const animationUrls = String(env.VITE_CUMA_ANIMATION_URLS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const targetHeightValue = Number(env.VITE_CUMA_CHARACTER_HEIGHT ?? 1.82);
  const headingOffsetValue = Number(env.VITE_CUMA_CHARACTER_HEADING ?? 0);

  return {
    modelUrl,
    animationUrls,
    targetHeight: Number.isFinite(targetHeightValue) && targetHeightValue > 0
      ? targetHeightValue
      : 1.82,
    headingOffset: Number.isFinite(headingOffsetValue) ? headingOffsetValue : 0,
  };
}
