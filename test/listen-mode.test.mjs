import { createListenMode } from '../src/ui/listenModeController.mjs';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function fakeContext({ resumeError } = {}) {
  const sources = [];
  return {
    state: 'suspended',
    currentTime: 0,
    resumeCalls: 0,
    sources,
    resume() {
      this.resumeCalls += 1;
      if (resumeError) return Promise.reject(resumeError);
      this.state = 'running';
      return Promise.resolve();
    },
    createBufferSource() {
      const source = {
        buffer: null,
        loop: false,
        connected: null,
        starts: [],
        stops: 0,
        connect(node) { this.connected = node; },
        disconnect() { this.connected = null; },
        start(when, offset) { this.starts.push({ when, offset }); },
        stop() { this.stops += 1; },
      };
      sources.push(source);
      return source;
    },
  };
}

export async function runListenModeTests() {
  const lines = [];
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
    lines.push('✓ ' + message);
  };
  const presetA = { id: 'a', song: 'A', demoRiff: '/a.mp3' };
  const presetB = { id: 'b', song: 'B', demoRiff: '/b.mp3' };
  const input = {};

  const ctx = fakeContext();
  let loads = 0;
  let playStops = 0;
  const prepared = [];
  const controller = createListenMode(ctx, input, {
    loadBuffer: async () => {
      loads += 1;
      return { duration: 10 };
    },
    preparePreset: async (preset) => prepared.push(preset.id),
    stopPlayMode: () => { playStops += 1; },
  });

  await controller.start(presetA);
  assert(ctx.resumeCalls === 1, 'start resumes a suspended AudioContext');
  assert(controller.getState().status === 'playing', 'start publishes playing state');
  assert(ctx.sources[0].loop && ctx.sources[0].connected === input, 'source loops through Listen input');
  assert(prepared.join(',') === 'a' && playStops === 1, 'preset prepares and Play Mode stops');

  ctx.currentTime = 3.25;
  assert(controller.pause(), 'pause succeeds while playing');
  assert(controller.getState().status === 'paused', 'pause publishes paused state');
  await controller.start(presetA);
  assert(loads === 1, 'decoded buffers are cached by URL');
  assert(ctx.sources[1].starts[0].offset === 3.25, 'resume starts from the paused offset');

  const retryCtx = fakeContext();
  let retryLoads = 0;
  let surfaced = '';
  const retryController = createListenMode(retryCtx, input, {
    loadBuffer: async () => {
      retryLoads += 1;
      if (retryLoads === 1) throw new Error('decode failed');
      return { duration: 4 };
    },
    onError: (message) => { surfaced = message; },
  });
  await retryController.start(presetA);
  assert(
    retryController.getState().status === 'error' && surfaced.includes('decode failed'),
    'decode failure is surfaced'
  );
  await retryController.start(presetA);
  assert(
    retryLoads === 2 && retryController.getState().status === 'playing',
    'retry performs a fresh load and recovers'
  );

  const rejectedContext = fakeContext({ resumeError: new Error('autoplay denied') });
  let resumeError = '';
  const rejectedController = createListenMode(rejectedContext, input, {
    loadBuffer: async () => ({ duration: 4 }),
    onError: (message) => { resumeError = message; },
  });
  const rejectedStart = await rejectedController.start(presetA);
  assert(
    !rejectedStart &&
      rejectedController.getState().status === 'error' &&
      resumeError.includes('Audio playback could not start'),
    'resume rejection remains a terminal error'
  );
  assert(rejectedContext.sources.length === 0, 'resume rejection never creates a source');

  const raceCtx = fakeContext();
  const pendingA = deferred();
  const pendingB = deferred();
  const racePrepared = [];
  const raceController = createListenMode(raceCtx, input, {
    loadBuffer: (_context, url) => url === '/a.mp3' ? pendingA.promise : pendingB.promise,
    preparePreset: async (preset) => racePrepared.push(preset.id),
  });
  const startA = raceController.start(presetA);
  const startB = raceController.start(presetB);
  pendingB.resolve({ duration: 5 });
  await startB;
  pendingA.resolve({ duration: 5 });
  await startA;
  assert(raceController.getState().presetId === 'b', 'latest rapid selection owns playback state');
  assert(
    racePrepared.join(',') === 'b' && raceCtx.sources.length === 1,
    'stale selection never prepares or creates a source'
  );

  return lines;
}

if (typeof process !== 'undefined') {
  runListenModeTests()
    .then((lines) => {
      console.log(lines.join('\n'));
      console.log('\nListen Mode controller tests passed.');
    })
    .catch((error) => {
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    });
}
