// Preset card grid (PRD §5.1/§7): one card per preset, filterable by era.
// Only one preset can be "live" in the single shared Engine at a time (see
// engine.js — one AudioContext graph, not one per card). The active card gets
// full interactive knobs + a Play/Listen pill pair; every other card shows the
// same header/gear-chain/story plus read-only knob values and a single
// "Listen" button that promotes it to active (crossfading the engine, PRD
// §5.2) the moment it's pressed.
import { renderPresetCard } from './presetCard.js';
import { initKnobs, renderStaticKnobs } from './knobs.js';

export function initPresetGrid(container, options) {
  const {
    presets,
    engine,
    context,
    playMode,
    listenMode,
    mobile,
    getSelectedDeviceId,
    getActivePresetId, // () => string
    getResetToOriginal, // () => function
    onError,
    initialEra,
  } = options;

  let eraFilter = initialEra || null;
  function listenLabel(preset) {
    const state = listenMode.getState();
    if (state.presetId !== preset.id) return '▶ Listen';
    if (state.status === 'loading') return '… Loading';
    if (state.status === 'playing') return '❚❚ Pause';
    if (state.status === 'paused') return '▶ Resume';
    if (state.status === 'error') return '↻ Retry';
    return '▶ Listen';
  }

  function friendlyPlayModeError(e) {
    if (e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')) {
      return 'Microphone access denied — staying in Listen Mode.';
    }
    if (e && (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError')) {
      return 'No audio input device found — staying in Listen Mode.';
    }
    return 'Could not start Play Mode: ' + (e && e.message ? e.message : e) + ' — staying in Listen Mode.';
  }

  function renderActiveControls(el, preset) {
    el.innerHTML = '';

    const listenBtn = document.createElement('button');
    listenBtn.type = 'button';
    listenBtn.className = 'play-toggle';
    const listenState = listenMode.getState();
    listenBtn.textContent = listenLabel(preset);
    listenBtn.classList.toggle(
      'playing',
      listenState.presetId === preset.id && listenState.status === 'playing'
    );
    listenBtn.setAttribute(
      'aria-pressed',
      String(listenState.presetId === preset.id && listenState.status === 'playing')
    );
    listenBtn.setAttribute(
      'aria-busy',
      String(listenState.presetId === preset.id && listenState.status === 'loading')
    );
    listenBtn.disabled =
      listenState.presetId === preset.id && listenState.status === 'loading';
    listenBtn.addEventListener('click', async () => {
      const current = listenMode.getState();
      if (current.presetId === preset.id && current.status === 'playing') {
        listenMode.pause();
      } else {
        await listenMode.start(preset);
      }
    });
    el.appendChild(listenBtn);

    if (mobile) {
      const hint = document.createElement('p');
      hint.className = 'mobile-hint';
      hint.textContent = 'Play Mode needs desktop Chrome + an audio interface.';
      el.appendChild(hint);
      return;
    }

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'play-toggle play-toggle-live';
    const syncPlayLabel = () => {
      const active = playMode.isActive();
      playBtn.textContent = active ? '❚❚ Stop' : '🎸 Play';
      playBtn.classList.toggle('playing', active);
      playBtn.setAttribute('aria-pressed', String(active));
    };
    syncPlayLabel();
    playBtn.addEventListener('click', async () => {
      if (playMode.isActive()) {
        playMode.stop();
        syncPlayLabel();
        return;
      }
      playBtn.disabled = true;
      listenMode.stop();
      try {
        await playMode.start(getSelectedDeviceId ? getSelectedDeviceId() : undefined);
        if (context.state === 'suspended') await context.resume();
      } catch (e) {
        if (onError) onError(friendlyPlayModeError(e));
      } finally {
        playBtn.disabled = false;
        render();
      }
    });
    el.appendChild(playBtn);
  }

  function renderInactiveControls(el, preset) {
    el.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'play-toggle play-toggle-select';
    const state = listenMode.getState();
    btn.textContent = listenLabel(preset);
    btn.disabled = state.presetId === preset.id && state.status === 'loading';
    btn.setAttribute(
      'aria-pressed',
      String(state.presetId === preset.id && state.status === 'playing')
    );
    btn.setAttribute(
      'aria-busy',
      String(state.presetId === preset.id && state.status === 'loading')
    );
    btn.addEventListener('click', async () => {
      await listenMode.start(preset);
    });
    el.appendChild(btn);
  }

  function render() {
    const activeId = getActivePresetId();
    container.innerHTML = '';
    presets
      .filter((preset) => !eraFilter || preset.era === eraFilter)
      .forEach((preset) => {
        const isActive = preset.id === activeId;

        const tile = document.createElement('article');
        tile.className = 'preset-tile' + (isActive ? ' active' : '');
        tile.setAttribute('aria-current', isActive ? 'true' : 'false');

        const cardBody = document.createElement('div');
        cardBody.className = 'preset-card';
        renderPresetCard(cardBody, preset);
        tile.appendChild(cardBody);

        const knobsEl = document.createElement('div');
        knobsEl.className = 'knobs';
        tile.appendChild(knobsEl);

        const controlsEl = document.createElement('div');
        controlsEl.className = 'card-controls';
        tile.appendChild(controlsEl);

        if (isActive) {
          initKnobs(knobsEl, engine, preset, getResetToOriginal());
          renderActiveControls(controlsEl, preset);
        } else {
          renderStaticKnobs(knobsEl, preset);
          renderInactiveControls(controlsEl, preset);
        }

        container.appendChild(tile);
      });
  }

  render();

  return {
    filterByEra(eraId) {
      eraFilter = eraId;
      render();
    },
    refresh: render,
  };
}
