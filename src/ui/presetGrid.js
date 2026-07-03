// Preset card grid (PRD §5.1/§7): one card per preset, filterable by era.
// Only one preset can be "live" in the single shared Engine at a time (see
// engine.js — one AudioContext graph, not one per card). The active card gets
// full interactive knobs + a Play/Listen pill pair; every other card shows the
// same header/gear-chain/story plus read-only knob values and a single
// "Listen" button that promotes it to active (crossfading the engine, PRD
// §5.2) the moment it's pressed.
import { renderPresetCard } from './presetCard.js';
import { initKnobs, renderStaticKnobs } from './knobs.js';
import { isMobile } from './playMode.js';

export function initPresetGrid(container, options) {
  const {
    presets,
    engine,
    context,
    playMode,
    getSelectedDeviceId,
    activate, // (preset) => Promise, resolves once engine + tweak persistence reflect `preset`
    getActivePresetId, // () => string
    getResetToOriginal, // () => function
    onError,
    initialEra,
  } = options;

  const audio = document.createElement('audio');
  audio.loop = true;
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.style.display = 'none';
  audio.addEventListener('error', () => {
    if (onError) onError('Demo riff failed to load: ' + (audio.dataset.riff || audio.src));
  });
  document.body.appendChild(audio);
  const audioSource = context.createMediaElementSource(audio);
  audioSource.connect(engine.input);

  let eraFilter = initialEra || null;
  const listenState = { playing: false, presetId: null };
  const playState = { active: false };

  function loadRiff(preset) {
    if (audio.dataset.riff === preset.demoRiff) return;
    audio.innerHTML = '';
    const mp3 = document.createElement('source');
    mp3.src = preset.demoRiff;
    mp3.type = 'audio/mpeg';
    const ogg = document.createElement('source');
    ogg.src = preset.demoRiff.replace(/\.mp3$/, '.ogg');
    ogg.type = 'audio/ogg';
    audio.appendChild(mp3);
    audio.appendChild(ogg);
    audio.dataset.riff = preset.demoRiff;
    audio.load();
  }

  // Must be called synchronously within a user-gesture handler, before any
  // `await`, so the eventual audio.play() call stays inside the gesture
  // (Safari autoplay policy). Everything here up to the play() call is sync.
  async function startListen(preset) {
    if (playMode.isActive()) {
      playMode.stop();
      playState.active = false;
    }
    loadRiff(preset);
    if (context.state === 'suspended') context.resume().catch(() => {});
    listenState.presetId = preset.id;
    try {
      await audio.play();
      listenState.playing = true;
    } catch (e) {
      listenState.playing = false;
      if (onError) onError('Playback blocked: ' + e.message);
    }
  }

  function pauseListen() {
    audio.pause();
    listenState.playing = false;
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
    const syncListenLabel = () => {
      const on = listenState.playing && listenState.presetId === preset.id;
      listenBtn.textContent = on ? '❚❚ Pause' : '▶ Listen';
      listenBtn.classList.toggle('playing', on);
    };
    syncListenLabel();
    listenBtn.addEventListener('click', async () => {
      const on = listenState.playing && listenState.presetId === preset.id;
      if (on) {
        pauseListen();
      } else {
        await startListen(preset);
      }
      syncListenLabel();
    });
    el.appendChild(listenBtn);

    if (isMobile()) {
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
      playBtn.textContent = playState.active ? '❚❚ Stop' : '🎸 Play';
      playBtn.classList.toggle('playing', playState.active);
    };
    syncPlayLabel();
    playBtn.addEventListener('click', async () => {
      if (playState.active) {
        playMode.stop();
        playState.active = false;
        syncPlayLabel();
        return;
      }
      playBtn.disabled = true;
      if (listenState.playing) {
        pauseListen();
        syncListenLabel();
      }
      try {
        await playMode.start(getSelectedDeviceId ? getSelectedDeviceId() : undefined);
        if (context.state === 'suspended') await context.resume();
        playState.active = true;
      } catch (e) {
        if (onError) onError(friendlyPlayModeError(e));
      } finally {
        playBtn.disabled = false;
        syncPlayLabel();
      }
    });
    el.appendChild(playBtn);
  }

  function renderInactiveControls(el, preset) {
    el.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'play-toggle play-toggle-select';
    btn.textContent = '▶ Listen';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await startListen(preset);
      try {
        await activate(preset);
      } finally {
        render();
      }
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
