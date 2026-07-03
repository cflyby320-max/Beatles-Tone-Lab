// Waveshaper curve factory, ported from js/distorsionFactory.js but trimmed to
// the only two curves the FENDER_BLACKFACE voicing uses:
//   - 'asymetric' : preamp stage 1 (generates odd harmonics; needs the DC
//                   blocker highpass that already sits after it in the chain)
//   - 'standard'  : preamp stage 2 + power-amp soft clip (even harmonics)
// Curves are precomputed Float32Arrays (no ScriptProcessorNode anywhere).

const N_SAMPLES = 44100;

function tanh(n) {
  return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
}

// WebAudio-spec classic distortion, used for the 'standard' curve.
function classicDistortion(k) {
  const curve = new Float32Array(N_SAMPLES);
  const deg = Math.PI / 180;
  for (let i = 0; i < N_SAMPLES; i++) {
    const x = (i * 2) / N_SAMPLES - 1;
    curve[i] = ((3 + k) * x * 57 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Tuna-derived asymmetric transfer function (odd harmonics).
function asymetric(amount) {
  const curve = new Float32Array(N_SAMPLES);
  for (let i = 0; i < N_SAMPLES; i++) {
    const x = (i * 2) / N_SAMPLES - 1;
    if (x < -0.08905) {
      curve[i] =
        (-3 / 4) *
          (1 -
            Math.pow(1 - (Math.abs(x) - 0.032857), 12) +
            (1 / 3) * (Math.abs(x) - 0.032847)) +
        0.01;
    } else if (x >= -0.08905 && x < 0.320018) {
      curve[i] = -6.153 * (x * x) + 3.9375 * x;
    } else {
      curve[i] = 0.630035;
    }
  }
  // `amount` intentionally does not reshape the asymmetric curve in the base
  // engine either — the drive amount is applied via interstage gain, not by
  // rescaling this fixed curve. Kept as a parameter for API symmetry.
  void amount;
  return curve;
}

export function createWaveShapers() {
  const curves = {
    standard: (distortionValue) => classicDistortion(distortionValue),
    asymetric: (distortionValue) => asymetric(distortionValue),
  };
  return { curves };
}

// Ported verbatim from js/amp.js:813-827 — maps a 0..10 "drive" slider onto a
// logarithmic k in [10, 1500] that feeds the curve functions. A voicing decides
// how far up this range a given normalized param is allowed to push.
export function kFromDrive(sliderValue) {
  const value = 150 * Number(sliderValue);
  const minp = 0;
  const maxp = 1500;
  const minv = Math.log(10);
  const maxv = Math.log(1500);
  const scale = (maxv - minv) / (maxp - minp);
  return Math.exp(minv + scale * (value - minp));
}
