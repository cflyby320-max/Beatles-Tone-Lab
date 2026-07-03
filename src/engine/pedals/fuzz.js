// Fuzz pedal (Tone Bender-ish, PRD §2.2): input HPF -> high-gain asymmetric
// WaveShaper -> tone LPF -> level. Needed for Taxman and Helter Skelter.
// Bypass is a hard dry/wet reroute (dry=1/wet=0 when off), same pattern as
// compressor/slapEcho, so "off" is provably transparent for the determinism
// test rather than a neutralized-params fake.
import { clamp } from '../utils/clamp.js';

const N_SAMPLES = 44100;
const BIAS = 0.12; // DC offset fed into a symmetric tanh -> asymmetric clip (odd+even harmonics)
const DRIVE_K = 35; // fixed high-gain amount (draft; not exposed as a preset param in v1)

function makeFuzzCurve() {
  const curve = new Float32Array(N_SAMPLES);
  const norm = Math.tanh(DRIVE_K * (1 + BIAS));
  for (let i = 0; i < N_SAMPLES; i++) {
    const x = (i * 2) / N_SAMPLES - 1;
    curve[i] = Math.tanh(DRIVE_K * (x + BIAS)) / norm;
  }
  return curve;
}

export function createFuzz(context) {
  const input = context.createGain();
  const output = context.createGain();
  const dry = context.createGain();
  const wet = context.createGain();

  const hpf = context.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 220; // strip low end before clipping, keeps fuzz tight
  hpf.Q.value = 0.7071;

  const shaper = context.createWaveShaper();
  shaper.curve = makeFuzzCurve();

  const lpf = context.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 3200; // "tone" control (draft default)
  lpf.Q.value = 0.7071;

  const level = context.createGain();
  level.gain.value = 0.5; // tames the post-clip level (draft default)

  input.connect(dry);
  dry.connect(output);

  input.connect(hpf);
  hpf.connect(shaper);
  shaper.connect(lpf);
  lpf.connect(level);
  level.connect(wet);
  wet.connect(output);

  // start bypassed
  dry.gain.value = 1;
  wet.gain.value = 0;

  function setOn(on) {
    dry.gain.value = on ? 0 : 1;
    wet.gain.value = on ? 1 : 0;
  }

  function setParams(p) {
    if (!p) return;
    if (p.tone !== undefined) lpf.frequency.value = clamp(p.tone, 500, 8000);
    if (p.level !== undefined) level.gain.value = clamp(p.level, 0, 1.5);
  }

  return { input, output, setOn, setParams };
}
