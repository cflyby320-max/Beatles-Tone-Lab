// Compressor pedal — DynamicsCompressorNode with musical (draft) defaults.
// Bypass is a hard dry/wet reroute (dry=1/wet=0 when off) so "off" is provably
// transparent for the determinism test, rather than a neutralized-params fake.
export function createCompressor(context) {
  const input = context.createGain();
  const output = context.createGain();
  const dry = context.createGain();
  const wet = context.createGain();
  const comp = context.createDynamicsCompressor();

  // draft musical defaults (slow-ish attack, medium release)
  comp.threshold.value = -24;
  comp.knee.value = 6;
  comp.ratio.value = 3;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;

  input.connect(dry);
  dry.connect(output);
  input.connect(comp);
  comp.connect(wet);
  wet.connect(output);

  // start bypassed
  dry.gain.value = 1;
  wet.gain.value = 0;

  function setOn(on) {
    dry.gain.value = on ? 0 : 1;
    wet.gain.value = on ? 1 : 0;
  }

  return { input, output, setOn };
}
