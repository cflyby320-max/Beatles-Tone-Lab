// Noise gate with NO ScriptProcessorNode (PRD §2.1, §8.1). An AnalyserNode taps
// the signal; a requestAnimationFrame loop reads RMS and ramps a GainNode toward
// open/closed via setTargetAtTime (smooth, no zipper noise).
//
// Under an OfflineAudioContext (the determinism test) the gate MUST stay a
// static open passthrough behind the SAME public API — otherwise the wall-clock
// rAF loop would write non-deterministic automation onto the gate during a
// non-real-time render. We detect offline by the context's `startRendering`
// method, NOT by the presence of requestAnimationFrame: an OfflineAudioContext
// created inside a browser page still has rAF on the window.
import { clamp } from './utils/clamp.js';

export function createNoiseGate(context, emitter) {
  const input = context.createGain();
  const gateGain = context.createGain();
  gateGain.gain.value = 1;

  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  const buffer = new Float32Array(analyser.fftSize);

  // series path (input -> gateGain -> output) + analyser tap
  input.connect(gateGain);
  input.connect(analyser);

  let thresholdDb = -55;
  let open = true;
  let live = false;

  function setThreshold(db) {
    thresholdDb = clamp(db, -100, 0);
  }

  function rmsDb() {
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    const rms = Math.sqrt(sum / buffer.length);
    return 20 * Math.log10(rms + 1e-9);
  }

  function tick() {
    if (!live) return;
    const db = rmsDb();
    const shouldOpen = db > thresholdDb;
    // fast attack when opening, slower release when closing
    const timeConstant = shouldOpen ? 0.005 : 0.05;
    gateGain.gain.setTargetAtTime(shouldOpen ? 1 : 0, context.currentTime, timeConstant);
    if (shouldOpen !== open) {
      open = shouldOpen;
      if (emitter) emitter.emit('gate', { open });
    }
    requestAnimationFrame(tick);
  }

  const isOffline = typeof context.startRendering === 'function';
  if (!isOffline && typeof requestAnimationFrame !== 'undefined') {
    live = true;
    requestAnimationFrame(tick);
  } else {
    // offline render (or no rAF): hold the gate open, fully deterministic
    gateGain.gain.value = 1;
  }

  return {
    input,
    output: gateGain,
    setThreshold,
    isLive() {
      return live;
    },
  };
}
