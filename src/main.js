// Bootstrap entry for the minimal Listen-Mode slice.
import { createAudioContext } from './engine/context.js';
import { Engine } from './engine/engine.js';
import { cabinetImpulses, reverbImpulses } from './presets/irRegistry.js';
import { initApp } from './ui/app.js';

const PRESET_URL = 'src/presets/get-back-1969.json';

async function boot() {
  const root = document.getElementById('app');
  let preset;
  try {
    const res = await fetch(PRESET_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    preset = await res.json();
  } catch (e) {
    root.innerHTML = '<p class="fatal">Could not load preset: ' + e.message + '</p>';
    return;
  }

  const context = createAudioContext();
  const engine = new Engine(context, { cabinetImpulses, reverbImpulses });
  engine.applyPreset(preset);

  initApp({ engine, preset, context, root });

  // expose for manual/headless debugging (Play-Mode wiring comes in a later milestone)
  window.__btl = { engine, context, preset };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
