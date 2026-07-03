// localStorage tweak persistence + reset (PRD §3.3). Deliberately lives in the
// UI layer, not src/engine/: the headless engine (Engine.applyPreset/setKnob)
// must stay pure and deterministic so the OfflineAudioContext determinism test
// — which drives Engine directly — is never affected by whatever happens to be
// sitting in a real browser's localStorage. This module is the only thing that
// reads/writes storage; it applies saved values through the same
// engine.setKnob() every other caller uses.
const KEY_PREFIX = 'btl.tweaks.';

function keyFor(presetId) {
  return KEY_PREFIX + presetId;
}

export function loadTweaks(presetId) {
  try {
    const raw = localStorage.getItem(keyFor(presetId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null; // storage unavailable (private mode, quota, disabled) — no saved tweaks
  }
}

function saveTweak(presetId, path, value) {
  try {
    const tweaks = loadTweaks(presetId) || {};
    tweaks[path] = value;
    localStorage.setItem(keyFor(presetId), JSON.stringify(tweaks));
  } catch (e) {
    /* storage unavailable — tweak just won't persist across reload */
  }
}

export function clearTweaks(presetId) {
  try {
    localStorage.removeItem(keyFor(presetId));
  } catch (e) {
    /* ignore */
  }
}

function getDeep(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Resolves a knob's displayed value for a preset that ISN'T the live engine
// preset: saved tweak override if one exists, else the preset's own JSON
// default. Never touches the engine — used to render inactive preset cards'
// read-only knob readouts.
export function resolveKnobValue(preset, path) {
  const tweaks = loadTweaks(preset.id);
  if (tweaks && Object.prototype.hasOwnProperty.call(tweaks, path)) return tweaks[path];
  return getDeep(preset.params, path);
}

// Applies any saved tweaks for this preset on top of the already-applied
// preset, then keeps persisting future knob moves. Returns a
// resetToOriginal() that clears storage and re-applies the preset from JSON
// alone (exhaustive — matches Engine.applyPreset's own guarantee).
export function attachTweakPersistence(engine, preset) {
  const saved = loadTweaks(preset.id);
  if (saved) {
    Object.keys(saved).forEach((path) => {
      if (preset.exposedKnobs.includes(path)) engine.setKnob(path, saved[path]);
    });
  }

  const stopListening = engine.on('knob', ({ path, value }) => {
    saveTweak(preset.id, path, value);
  });

  function resetToOriginal() {
    clearTweaks(preset.id);
    engine.applyPreset(preset);
  }

  return { resetToOriginal, stopListening };
}
