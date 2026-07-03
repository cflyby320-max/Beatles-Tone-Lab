// Safe numeric helpers. Every value that reaches an AudioParam should pass
// through clamp() so a malformed preset can never blow out a speaker or push
// NaN/Infinity into the graph (PRD §8.3).

export function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// Linear interpolation from a normalized 0..1 knob to a real-world range.
export function lerp(t, outMin, outMax) {
  return outMin + (outMax - outMin) * clamp(t, 0, 1);
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
