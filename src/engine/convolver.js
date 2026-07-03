// Wet/dry convolver, ported from js/amp.js:1358-1481 (Convolver). Used for both
// the cabinet and the room reverb — the original was a single reusable factory
// too, so a shared module (rather than two near-identical cabinet.js/reverb.js
// files) is the faithful and DRY port. Menu-building DOM code removed; IR load
// now reports success/failure through the emitter (PRD §8.5).
import { loadSample } from './utils/loadSample.js';
import { clamp } from './utils/clamp.js';

// impulses: [{ name, url }, ...]
export function createConvolver(context, impulses, emitter, label) {
  const inputGain = context.createGain();
  const outputGain = context.createGain();
  const convolverNode = context.createConvolver();
  const convolverGain = context.createGain();
  convolverGain.gain.value = 0;
  const directGain = context.createGain();
  directGain.gain.value = 1;

  const IRs = impulses;
  let currentImpulse = IRs[0];
  // Tracks the most recently triggered load, whether still in flight or
  // already settled. loadImpulseByName() is fire-and-forget from a voicing's
  // apply() (it must stay synchronous), so anything that needs the graph to be
  // fully settled before proceeding — e.g. an offline render right after
  // switching presets to a different cabinet IR — must await whenSettled()
  // first. Without this, rendering could start before the new IR's
  // fetch+decode finishes, which is a real, timing-dependent source of
  // non-determinism (caught by test/determinism.html's cross-preset check).
  let pending;

  // dry route
  inputGain.connect(directGain);
  directGain.connect(outputGain);
  // wet route
  inputGain.connect(convolverNode);
  convolverNode.connect(convolverGain);
  convolverGain.connect(outputGain);

  setGain(0.2);
  // `ready` resolves when the INITIAL IR has loaded+decoded (or failed) — lets
  // the UI show a loading state and lets offline renders wait for a
  // deterministic graph before rendering.
  const ready = loadImpulseByUrl(currentImpulse.url);

  function loadImpulseByUrl(url) {
    const promise = loadSample(context, url)
      .then((buffer) => {
        convolverNode.buffer = buffer;
        if (emitter) emitter.emit('ir-loaded', { label, name: currentImpulse.name, url });
      })
      .catch((err) => {
        // Never leave a silently broken graph — surface it.
        if (emitter) emitter.emit('ir-error', { label, url, error: err });
        else console.error('IR load failed (' + label + '):', url, err);
      });
    pending = promise;
    return promise;
  }

  function loadImpulseByName(name) {
    if (name === undefined) name = IRs[0].name;
    const match = IRs.find((ir) => ir.name === name);
    if (!match) {
      if (emitter) emitter.emit('ir-error', { label, url: name, error: new Error('unknown IR "' + name + '"') });
      return Promise.resolve();
    }
    currentImpulse = match;
    return loadImpulseByUrl(match.url);
  }

  function whenSettled() {
    return pending;
  }

  // Equal-power crossfade between dry and wet. value in [0, 1].
  function setGain(value) {
    const v = clamp(value, 0, 1);
    directGain.gain.value = Math.cos((v * Math.PI) / 2);
    convolverGain.gain.value = Math.cos(((1 - v) * Math.PI) / 2);
  }

  function getName() {
    return currentImpulse.name;
  }

  return {
    input: inputGain,
    output: outputGain,
    ready,
    setGain,
    getName,
    loadImpulseByName,
    whenSettled,
  };
}
