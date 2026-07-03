// Listen Mode (PRD §4): lazily decode each preset's dry demo riff, then loop
// it through the same shared engine input used by Play Mode. AudioBufferSource
// nodes are one-shot, so every start/resume creates a fresh source.
import { loadSample } from '../engine/utils/loadSample.js';

function messageFor(preset, error) {
  const detail = error && error.message ? error.message : String(error);
  return 'Demo riff failed to load for ' + preset.song + ': ' + detail;
}

export function createListenMode(context, engineInput, callbacks = {}) {
  const {
    preparePreset = async () => {},
    stopPlayMode = () => {},
    onStateChange = () => {},
    onError = () => {},
    onClearError = () => {},
    loadBuffer = loadSample,
  } = callbacks;

  const bufferCache = new Map();
  let state = { status: 'idle', presetId: null, error: null };
  let requestToken = 0;
  let prepareQueue = Promise.resolve();
  let source = null;
  let buffer = null;
  let preset = null;
  let offset = 0;
  let startedAt = 0;

  function publish(status, presetId = preset ? preset.id : null, error = null) {
    state = { status, presetId, error };
    onStateChange({ ...state });
  }

  function getBuffer(url) {
    if (!bufferCache.has(url)) {
      const pending = Promise.resolve(loadBuffer(context, url)).catch((error) => {
        bufferCache.delete(url); // a retry must perform a fresh fetch/decode
        throw error;
      });
      bufferCache.set(url, pending);
    }
    return bufferCache.get(url);
  }

  function stopSource(preserveOffset) {
    if (!source) return;
    if (preserveOffset && buffer && buffer.duration > 0) {
      offset = Math.max(0, (context.currentTime - startedAt) % buffer.duration);
    }
    source.onended = null;
    try {
      source.stop();
    } catch (error) {
      // A source that already ended is still safe to disconnect.
    }
    source.disconnect();
    source = null;
  }

  function resetPlayback() {
    stopSource(false);
    buffer = null;
    preset = null;
    offset = 0;
    startedAt = 0;
  }

  async function prepareInOrder(nextPreset, token) {
    prepareQueue = prepareQueue
      .catch(() => {})
      .then(async () => {
        if (token !== requestToken) return false;
        await preparePreset(nextPreset);
        return token === requestToken;
      });
    return prepareQueue;
  }

  async function start(nextPreset) {
    const token = ++requestToken;
    const resumeFromPause = preset && preset.id === nextPreset.id && state.status === 'paused';

    stopPlayMode();
    stopSource(false);
    if (!resumeFromPause) offset = 0;
    preset = nextPreset;
    buffer = null;
    onClearError();
    publish('loading', nextPreset.id);

    // Call resume synchronously from the click handler before the first await.
    const resumePromise =
      context.state === 'suspended' ? context.resume() : Promise.resolve();
    Promise.resolve(resumePromise).catch((error) => {
      if (token !== requestToken) return;
      stopSource(false);
      const message = 'Audio playback could not start: ' +
        (error && error.message ? error.message : String(error));
      publish('error', nextPreset.id, message);
      onError(message, error);
    });

    try {
      const decoded = await getBuffer(nextPreset.demoRiff);
      if (token !== requestToken) return false;

      const prepared = await prepareInOrder(nextPreset, token);
      if (!prepared || token !== requestToken) return false;

      buffer = decoded;
      source = context.createBufferSource();
      source.buffer = decoded;
      source.loop = true;
      source.connect(engineInput);
      startedAt = context.currentTime - offset;
      source.start(0, offset);
      publish('playing', nextPreset.id);
      return true;
    } catch (error) {
      if (token !== requestToken) return false;
      stopSource(false);
      buffer = null;
      offset = 0;
      const message = messageFor(nextPreset, error);
      publish('error', nextPreset.id, message);
      onError(message, error);
      return false;
    }
  }

  function pause() {
    if (state.status !== 'playing' || !source) return false;
    requestToken += 1;
    stopSource(true);
    publish('paused');
    return true;
  }

  function stop() {
    requestToken += 1;
    resetPlayback();
    publish('idle', null);
  }

  function getState() {
    return { ...state };
  }

  return {
    start,
    pause,
    stop,
    getState,
    isPlaying: () => state.status === 'playing',
  };
}
