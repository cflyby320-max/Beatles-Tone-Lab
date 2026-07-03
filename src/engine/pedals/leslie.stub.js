// STUB — DSP intentionally NOT implemented in this milestone (vertical slice).
// The Get Back preset does not use a Leslie/vibrato; preset #4 (Lucy in the
// Sky) will. See PRD §2.2 (chorus-style modulated DelayNode + amplitude trem +
// light stereo spread). Until then this is a straight wire.
export function createLeslie(context) {
  const input = context.createGain();
  return {
    input,
    output: input,
    setOn() {
      /* no-op: stub */
    },
  };
}
