// Status bar (PRD §5.1): AudioContext state, sample rate, measured latency, and
// an error surface for IR/riff failures. Subscribes once to engine 'ir-error'.
import { measuredLatencyMs } from '../engine/context.js';

export function initStatusBar(container, engine, context) {
  container.innerHTML =
    '<span class="stat" id="stat-state"></span>' +
    '<span class="stat" id="stat-rate"></span>' +
    '<span class="stat" id="stat-latency"></span>' +
    '<span class="stat stat-error" id="stat-error" hidden></span>';

  const stateEl = container.querySelector('#stat-state');
  const rateEl = container.querySelector('#stat-rate');
  const latencyEl = container.querySelector('#stat-latency');
  const errorEl = container.querySelector('#stat-error');

  function refresh() {
    stateEl.textContent = 'audio: ' + context.state;
    rateEl.textContent = (context.sampleRate / 1000).toFixed(1) + ' kHz';
    const ms = measuredLatencyMs(context);
    latencyEl.textContent = ms != null ? 'latency: ' + ms.toFixed(1) + ' ms' : 'latency: —';
  }

  function showError(msg) {
    errorEl.textContent = '⚠ ' + msg;
    errorEl.hidden = false;
  }

  engine.on('ir-error', (e) => {
    showError('IR load failed (' + e.label + '): ' + e.url);
  });

  if (typeof context.addEventListener === 'function') {
    context.addEventListener('statechange', refresh);
  }
  refresh();
  // latency only becomes meaningful once running; poll lightly.
  setInterval(refresh, 1000);

  return { refresh, showError };
}
