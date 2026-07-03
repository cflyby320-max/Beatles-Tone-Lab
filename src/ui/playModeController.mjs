// Play Mode controller: live guitar via getUserMedia (PRD §2.1/§4/§5).
// Permission prompts make start() asynchronous, so every start captures a
// generation token and stop() invalidates it. A start whose token has gone
// stale — because Listen Mode (or anything else) called stop() while the
// permission prompt was open — must stop the late stream's tracks and never
// connect a MediaStreamSource; it resolves `null` so callers can treat
// cancellation as expected control flow rather than an error. The media
// devices accessor is injected so this state machine can also run in Node CI.
export function createPlayMode(context, destinationNode, options = {}) {
  const { getMediaDevices = () => navigator.mediaDevices } = options;

  let stream = null;
  let source = null;
  let generation = 0;
  let starting = false;

  async function enumerateInputs() {
    const mediaDevices = getMediaDevices();
    if (!mediaDevices || !mediaDevices.enumerateDevices) return [];
    const devices = await mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  async function start(deviceId) {
    stop();
    const token = ++generation;
    starting = true;
    const constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    };
    let acquired;
    try {
      acquired = await getMediaDevices().getUserMedia(constraints);
    } catch (error) {
      if (token !== generation) return null; // cancelled — outcome no longer matters
      starting = false;
      throw error;
    }
    if (token !== generation) {
      acquired.getTracks().forEach((track) => track.stop());
      return null;
    }
    starting = false;
    stream = acquired;
    source = context.createMediaStreamSource(stream);
    source.connect(destinationNode);
    return stream;
  }

  function stop() {
    generation += 1;
    starting = false;
    if (source) {
      source.disconnect();
      source = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
  }

  function isActive() {
    return !!stream;
  }

  function isStarting() {
    return starting;
  }

  return { enumerateInputs, start, stop, isActive, isStarting };
}
