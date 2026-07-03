// Bootstrap entry (M3): loads all 6 presets, builds one shared Engine, and
// wires the timeline + preset grid + status bar around it. Only one preset is
// ever "live" in the engine at a time (see engine.js — one AudioContext graph,
// not one per card); switching which one is live goes through
// engine.crossfadeToPreset() so it's never an audible pop (PRD §5.2).
import { createAudioContext } from './engine/context.js';
import { Engine } from './engine/engine.js';
import { cabinetImpulses, reverbImpulses } from './presets/irRegistry.js';
import { attachTweakPersistence } from './ui/tweakPersistence.js';
import { initTimeline } from './ui/timeline.js';
import { initPresetGrid } from './ui/presetGrid.js';
import { initStatusBar } from './ui/statusBar.js';
import { createPlayMode } from './ui/playMode.js';

const PRESET_FILES = [
  'i-saw-her-standing-there-1963.json',
  'a-hard-days-night-1964.json',
  'taxman-1966.json',
  'lucy-in-the-sky-1967.json',
  'helter-skelter-1968.json',
  'get-back-1969.json',
];

const INITIAL_PRESET_ID = 'get-back-1969';

async function loadPresets() {
  return Promise.all(
    PRESET_FILES.map((file) =>
      fetch('src/presets/' + file).then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' loading ' + file);
        return res.json();
      })
    )
  );
}

async function boot() {
  const root = document.getElementById('app');
  let presets;
  try {
    presets = await loadPresets();
  } catch (e) {
    root.innerHTML = '<p class="fatal">Could not load presets: ' + e.message + '</p>';
    return;
  }

  const initialPreset = presets.find((p) => p.id === INITIAL_PRESET_ID) || presets[0];

  const context = createAudioContext();
  const engine = new Engine(context, { cabinetImpulses, reverbImpulses });
  await engine.applyPreset(initialPreset);
  let tweaks = attachTweakPersistence(engine, initialPreset);
  let activePresetId = initialPreset.id;

  // Downstream listening-volume trim (independent of any preset's own
  // "Master" tone knob) — spliced in after the engine's own destination hookup.
  const monitorGain = context.createGain();
  monitorGain.gain.value = 1;
  engine.output.disconnect(context.destination);
  engine.output.connect(monitorGain);
  monitorGain.connect(context.destination);

  // Level-meter tap: a parallel, non-destructive connection off engine.input,
  // so it reflects whichever source (live mic or Listen Mode riff) is
  // currently feeding the chain.
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  engine.input.connect(analyser);

  const playMode = createPlayMode(context, engine.input);

  const statusBar = initStatusBar(root.querySelector('#status-bar'), engine, context, {
    playMode,
    monitorGain,
    analyser,
  });

  async function activatePreset(preset) {
    if (preset.id === activePresetId) return;
    tweaks.stopListening();
    await engine.crossfadeToPreset(preset, 80);
    tweaks = attachTweakPersistence(engine, preset);
    activePresetId = preset.id;
  }

  const grid = initPresetGrid(root.querySelector('#preset-grid'), {
    presets,
    engine,
    context,
    playMode,
    getSelectedDeviceId: statusBar.getSelectedDeviceId,
    activate: activatePreset,
    getActivePresetId: () => activePresetId,
    getResetToOriginal: () => tweaks.resetToOriginal,
    onError: statusBar.showError,
    initialEra: initialPreset.era,
  });

  initTimeline(root.querySelector('#timeline'), {
    root,
    initialEra: initialPreset.era,
    onEraChange: (era) => grid.filterByEra(era),
  });

  // expose for manual/headless debugging
  window.__btl = { engine, context, presets, activatePreset };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
