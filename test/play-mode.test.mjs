// Play Mode controller tests, focused on the pending-permission race: a
// getUserMedia() prompt can stay open indefinitely, and anything that calls
// playMode.stop() in that window (Listen Mode does) must cancel the pending
// request so a late permission grant never connects a second live source on
// top of Listen playback.
import { createPlayMode } from '../src/ui/playModeController.mjs';
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

// One fake context serves both controllers: Play needs MediaStreamSources,
// Listen needs BufferSources; the race test wires both to it at once.
function fakeContext({ resumeError } = {}) {
  const mediaSources = [];
  const bufferSources = [];
  return {
    state: 'suspended',
    currentTime: 0,
    resumeCalls: 0,
    mediaSources,
    bufferSources,
    resume() {
      this.resumeCalls += 1;
      if (resumeError) return Promise.reject(resumeError);
      this.state = 'running';
      return Promise.resolve();
    },
    createMediaStreamSource(stream) {
      const source = {
        stream,
        connected: null,
        connect(node) { this.connected = node; },
        disconnect() { this.connected = null; },
      };
      mediaSources.push(source);
      return source;
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
      bufferSources.push(source);
      return source;
    },
  };
}

function fakeStream(id) {
  const tracks = [
    { id: id + '-track-0', stopCalls: 0, stop() { this.stopCalls += 1; } },
    { id: id + '-track-1', stopCalls: 0, stop() { this.stopCalls += 1; } },
  ];
  return { id, tracks, getTracks: () => tracks };
}

// Every getUserMedia call returns a deferred the test resolves/rejects by
// hand, so permission prompts can be left pending across other actions.
function fakeMediaDevices() {
  const requests = [];
  return {
    requests,
    getUserMedia(constraints) {
      const request = deferred();
      request.constraints = constraints;
      requests.push(request);
      return request.promise;
    },
  };
}

export async function runPlayModeTests() {
  const lines = [];
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
    lines.push('✓ ' + message);
  };
  const engineInput = { name: 'engine.input' };
  const listenInput = { name: 'engine.listenInput' };

  // --- ordinary successful startup -----------------------------------------
  {
    const ctx = fakeContext();
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    const startPromise = playMode.start('interface-1');
    assert(playMode.isStarting() && !playMode.isActive(), 'start() is pending while permission is unresolved');
    const stream = fakeStream('ok');
    devices.requests[0].resolve(stream);
    const started = await startPromise;
    assert(started === stream, 'successful start resolves the acquired stream');
    assert(
      devices.requests[0].constraints.audio.deviceId.exact === 'interface-1',
      'requested deviceId reaches getUserMedia constraints'
    );
    assert(
      ctx.mediaSources.length === 1 && ctx.mediaSources[0].connected === engineInput,
      'successful start connects one MediaStreamSource to the destination'
    );
    assert(playMode.isActive() && !playMode.isStarting(), 'successful start is active and no longer starting');

    // --- stopping an already-active stream ---------------------------------
    playMode.stop();
    assert(
      ctx.mediaSources[0].connected === null &&
        stream.tracks.every((t) => t.stopCalls === 1) &&
        !playMode.isActive() &&
        !playMode.isStarting(),
      'stop() disconnects the source and stops every track'
    );
  }

  // --- P1 regression: Listen during a pending permission prompt ------------
  {
    const ctx = fakeContext();
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    let playModeErrors = 0;
    const listenMode = createListenMode(ctx, listenInput, {
      loadBuffer: async () => ({ duration: 8 }),
      stopPlayMode: () => playMode.stop(),
      onError: () => { playModeErrors += 1; },
    });

    const startPromise = playMode.start();
    assert(playMode.isStarting(), 'Play is pending on the permission prompt');

    const preset = { id: 'get-back-1969', song: 'Get Back', demoRiff: '/riff.mp3' };
    const listenStarted = await listenMode.start(preset);
    assert(listenStarted && listenMode.getState().status === 'playing', 'Listen starts while Play permission is pending');
    assert(!playMode.isStarting(), 'starting Listen immediately clears the pending Play state');

    const lateStream = fakeStream('late');
    devices.requests[0].resolve(lateStream);
    const started = await startPromise;
    assert(started === null, 'the stale Play start resolves null instead of rejecting');
    assert(lateStream.tracks.every((t) => t.stopCalls === 1), 'every track on the late stream is stopped immediately');
    assert(ctx.mediaSources.length === 0, 'no MediaStreamSource is created or connected for the stale request');
    assert(!playMode.isActive() && !playMode.isStarting(), 'Play stays inactive and not starting after the late grant');
    assert(
      listenMode.getState().status === 'playing' &&
        listenMode.getState().presetId === preset.id &&
        ctx.bufferSources.length === 1 &&
        ctx.bufferSources[0].connected === listenInput &&
        ctx.bufferSources[0].stops === 0,
      'Listen remains the only active source and its state is untouched'
    );
    assert(playModeErrors === 0, 'no user-facing error is emitted for the cancelled Play request');
  }

  // --- getUserMedia rejection on a current (non-cancelled) request ---------
  {
    const ctx = fakeContext();
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    const startPromise = playMode.start();
    const denied = new Error('Permission denied');
    denied.name = 'NotAllowedError';
    devices.requests[0].reject(denied);
    let caught = null;
    try {
      await startPromise;
    } catch (error) {
      caught = error;
    }
    assert(caught === denied, 'a current request surfaces the getUserMedia rejection to the caller');
    assert(!playMode.isActive() && !playMode.isStarting(), 'a rejected request leaves Play inactive and not starting');
    assert(ctx.mediaSources.length === 0, 'a rejected request never creates a source');
  }

  // --- getUserMedia rejection on a stale (cancelled) request ---------------
  {
    const ctx = fakeContext();
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    const startPromise = playMode.start();
    playMode.stop();
    devices.requests[0].reject(new Error('Permission denied'));
    const started = await startPromise;
    assert(started === null, 'a stale rejection resolves null instead of rethrowing');
    assert(!playMode.isActive() && !playMode.isStarting(), 'a stale rejection leaves Play inactive');
  }

  // --- AudioContext resume failure after mic acquisition -------------------
  {
    const ctx = fakeContext({ resumeError: new Error('resume blocked') });
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    const startPromise = playMode.start();
    const stream = fakeStream('resume-fail');
    devices.requests[0].resolve(stream);
    const started = await startPromise;
    assert(started === stream && playMode.isActive(), 'the mic stream is live before the resume attempt');
    // presetGrid's click handler: resume after start, tear down on failure.
    let resumeFailed = false;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
    } catch (error) {
      resumeFailed = true;
      playMode.stop();
    }
    assert(resumeFailed, 'the resume failure reaches the caller');
    assert(
      stream.tracks.every((t) => t.stopCalls === 1) &&
        ctx.mediaSources[0].connected === null &&
        !playMode.isActive() &&
        !playMode.isStarting(),
      'resume-failure cleanup stops tracks and disconnects the source'
    );
  }

  // --- rapid Play → Listen → Play ------------------------------------------
  {
    const ctx = fakeContext();
    const devices = fakeMediaDevices();
    const playMode = createPlayMode(ctx, engineInput, { getMediaDevices: () => devices });
    const listenMode = createListenMode(ctx, listenInput, {
      loadBuffer: async () => ({ duration: 8 }),
      stopPlayMode: () => playMode.stop(),
    });
    const preset = { id: 'taxman-1966', song: 'Taxman', demoRiff: '/riff.mp3' };

    const firstStart = playMode.start();
    await listenMode.start(preset);
    listenMode.stop(); // the grid stops Listen before a new Play attempt
    const secondStart = playMode.start();

    // Resolve the stale request first, then the current one.
    const staleStream = fakeStream('stale');
    const currentStream = fakeStream('current');
    devices.requests[0].resolve(staleStream);
    devices.requests[1].resolve(currentStream);
    const [firstResult, secondResult] = await Promise.all([firstStart, secondStart]);

    assert(firstResult === null, 'the first (superseded) Play start resolves null');
    assert(staleStream.tracks.every((t) => t.stopCalls === 1), 'the superseded stream has all tracks stopped');
    assert(
      secondResult === currentStream &&
        ctx.mediaSources.length === 1 &&
        ctx.mediaSources[0].stream === currentStream &&
        ctx.mediaSources[0].connected === engineInput,
      'only the latest Play request connects a source'
    );
    assert(playMode.isActive() && !playMode.isStarting(), 'the latest Play request owns the active state');
    assert(listenMode.getState().status === 'idle', 'Listen stays stopped after the rapid sequence');
  }

  return lines;
}

if (typeof process !== 'undefined') {
  runPlayModeTests()
    .then((lines) => {
      console.log(lines.join('\n'));
      console.log('\nPlay Mode controller tests passed.');
    })
    .catch((error) => {
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    });
}
