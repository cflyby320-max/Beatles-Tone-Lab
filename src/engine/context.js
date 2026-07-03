// AudioContext factory. The base engine used a bare `new AudioContext()`
// (js/initAudio.js:3) with no latency hint; we request the lowest stable buffer
// (PRD §2.5) and expose a helper to read measured latency for the status bar.
export function createAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  return new AC({ latencyHint: 'interactive' });
}

// (baseLatency + outputLatency) in milliseconds, or null if unavailable.
export function measuredLatencyMs(context) {
  const base = typeof context.baseLatency === 'number' ? context.baseLatency : 0;
  const out = typeof context.outputLatency === 'number' ? context.outputLatency : 0;
  const total = base + out;
  return total > 0 ? total * 1000 : null;
}
