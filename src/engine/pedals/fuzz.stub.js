// STUB — DSP intentionally NOT implemented in this milestone (vertical slice).
// The Get Back preset does not use fuzz; presets #3 (Taxman) and #6 (Helter
// Skelter) will. See PRD §2.2 (Tone Bender-ish: HPF -> high-gain asymmetric
// WaveShaper -> tone LPF -> level). Until then this is a straight wire.
export function createFuzz(context) {
  const input = context.createGain();
  return {
    input,
    output: input,
    setOn() {
      /* no-op: stub */
    },
  };
}
