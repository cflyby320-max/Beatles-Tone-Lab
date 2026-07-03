// Play Mode: live guitar via getUserMedia (PRD §2.1/§4/§5). Desktop Chrome +
// external audio interface is the happy path; permission-denied or no-device
// falls back gracefully to Listen Mode (never a broken/blank control). Mobile
// hides the Play control entirely (PRD §4: "Mobile: Play Mode toggle hidden").
export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

export function createPlayMode(context, destinationNode) {
  let stream = null;
  let source = null;

  async function enumerateInputs() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  async function start(deviceId) {
    stop();
    const constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    source = context.createMediaStreamSource(stream);
    source.connect(destinationNode);
    return stream;
  }

  function stop() {
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

  return { enumerateInputs, start, stop, isActive };
}
