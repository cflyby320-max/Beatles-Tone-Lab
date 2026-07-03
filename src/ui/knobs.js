// The 4 exposed knobs (PRD §5.1/§7): Gain / Tone / Reverb / Master. Each is a
// keyboard-accessible range input bound straight to engine.setKnob(path). The UI
// owns the DOM; the engine stays headless. Double-click resets a single knob to
// the preset default; the "Reset to original" button (PRD §3.3) clears ALL
// saved tweaks for this preset via resetToOriginal (localStorage persistence
// lives in ui/tweakPersistence.js).
const KNOB_LABELS = {
  'preamp.gain': 'Gain',
  'tonestack.treble': 'Tone',
  'reverb.mix': 'Reverb',
  'master': 'Master',
};

export function initKnobs(container, engine, preset, resetToOriginal) {
  container.innerHTML = '';
  const defaults = {};
  const controls = [];

  preset.exposedKnobs.forEach((path) => {
    const label = KNOB_LABELS[path] || path;
    const initial = Number(engine.getKnob(path));
    defaults[path] = initial;

    const wrap = document.createElement('div');
    wrap.className = 'knob';

    const id = 'knob-' + path.replace(/\./g, '-');
    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    const readout = document.createElement('output');
    readout.className = 'knob-readout';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = String(initial);
    slider.setAttribute('aria-label', label);

    const format = (v) => (Number(v) * 10).toFixed(1);
    readout.value = format(initial);

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      engine.setKnob(path, v);
      readout.value = format(v);
    });

    // double-click to reset to the preset's original value
    slider.addEventListener('dblclick', () => {
      const v = defaults[path];
      slider.value = String(v);
      engine.setKnob(path, v);
      readout.value = format(v);
    });

    wrap.appendChild(labelEl);
    wrap.appendChild(slider);
    wrap.appendChild(readout);
    container.appendChild(wrap);

    controls.push({ path, slider, readout, format });
  });

  if (typeof resetToOriginal === 'function') {
    const resetWrap = document.createElement('div');
    resetWrap.className = 'knob-reset';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Reset to original';

    resetButton.addEventListener('click', () => {
      resetToOriginal();
      // Re-sync every slider/readout to the (now-restored) engine state.
      controls.forEach(({ path, slider, readout, format }) => {
        const v = Number(engine.getKnob(path));
        slider.value = String(v);
        readout.value = format(v);
      });
    });

    resetWrap.appendChild(resetButton);
    container.appendChild(resetWrap);
  }
}
