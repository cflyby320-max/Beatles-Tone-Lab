// Channel booster, ported near-verbatim from js/amp.js:1484-1564 (Boost).
// Already headless in the original — only change is a self-contained curve
// helper instead of leaning on the outer closure. Not exposed as a knob in this
// slice; sits in the chain defaulting to bypassed (transparent) so parity with
// the base engine's topology is preserved.
function makeDistortionCurve(k) {
  const nSamples = 44100;
  const curve = new Float32Array(nSamples);
  const deg = Math.PI / 180;
  for (let i = 0; i < nSamples; i++) {
    const x = (i * 2) / nSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function createBoost(context) {
  let activated = false;

  const input = context.createGain();
  const inputGain = context.createGain();
  inputGain.gain.value = 0;
  const byPass = context.createGain();
  byPass.gain.value = 1;
  const filter = context.createBiquadFilter();
  filter.frequency.value = 3317;
  const shaper = context.createWaveShaper();
  shaper.curve = makeDistortionCurve(640);
  const outputGain = context.createGain();
  outputGain.gain.value = 2;
  const output = context.createGain();

  // active route
  input.connect(inputGain);
  inputGain.connect(shaper);
  shaper.connect(filter);
  filter.connect(outputGain);
  outputGain.connect(output);
  // bypass route
  input.connect(byPass);
  byPass.connect(output);

  function isActivated() {
    return activated;
  }

  function toggle() {
    if (!activated) {
      byPass.gain.value = 0;
      inputGain.gain.value = 1;
    } else {
      byPass.gain.value = 1;
      inputGain.gain.value = 0;
    }
    activated = !activated;
  }

  function onOff(wantedState) {
    if (wantedState === undefined) {
      if (activated) toggle();
      return;
    }
    if (wantedState !== activated) toggle();
  }

  return { input, output, onOff, toggle, isActivated };
}
