// Status bar (PRD §5.1): input device selector, input level meter, measured
// latency, master volume, and an error surface for IR/riff/Play-Mode failures.
import { measuredLatencyMs } from '../engine/context.js';
import { clamp } from '../engine/utils/clamp.js';

export function initStatusBar(container, engine, context, extras) {
  const { playMode, monitorGain, analyser } = extras || {};

  container.innerHTML =
    '<div class="status-row status-row-controls">' +
    '<label class="status-field" for="stat-device">' +
    '<span class="status-label">Input</span>' +
    '<select id="stat-device" class="device-select"></select>' +
    '</label>' +
    '<div class="status-field status-meter-field">' +
    '<span class="status-label">Level</span>' +
    '<div class="level-meter" id="stat-level"><div class="level-meter-fill"></div></div>' +
    '</div>' +
    '<label class="status-field" for="stat-volume">' +
    '<span class="status-label">Volume</span>' +
    '<input id="stat-volume" type="range" min="0" max="1" step="0.01" />' +
    '</label>' +
    '</div>' +
    '<div class="status-row status-row-meta">' +
    '<span class="stat" id="stat-state"></span>' +
    '<span class="stat" id="stat-rate"></span>' +
    '<span class="stat" id="stat-latency"></span>' +
    '<span class="stat stat-error" id="stat-error" hidden></span>' +
    '</div>';

  const stateEl = container.querySelector('#stat-state');
  const rateEl = container.querySelector('#stat-rate');
  const latencyEl = container.querySelector('#stat-latency');
  const errorEl = container.querySelector('#stat-error');
  const deviceSelect = container.querySelector('#stat-device');
  const volumeSlider = container.querySelector('#stat-volume');
  const levelFill = container.querySelector('#stat-level .level-meter-fill');

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
  setInterval(refresh, 1000);

  // --- input device selector (PRD §5.1) ---
  async function populateDevices() {
    if (!playMode) {
      deviceSelect.disabled = true;
      return;
    }
    try {
      const inputs = await playMode.enumerateInputs();
      const previous = deviceSelect.value;
      deviceSelect.innerHTML = '';
      if (inputs.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No input devices found';
        deviceSelect.appendChild(opt);
        deviceSelect.disabled = true;
        return;
      }
      deviceSelect.disabled = false;
      inputs.forEach((d, i) => {
        const opt = document.createElement('option');
        opt.value = d.deviceId;
        opt.textContent = d.label || 'Input ' + (i + 1);
        deviceSelect.appendChild(opt);
      });
      if (inputs.some((d) => d.deviceId === previous)) deviceSelect.value = previous;
    } catch (e) {
      deviceSelect.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Input list unavailable';
      deviceSelect.appendChild(opt);
      deviceSelect.disabled = true;
    }
  }

  populateDevices();
  if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
    // Device labels only populate fully once mic permission is granted;
    // 'devicechange' fires again after that (and on real device changes).
    navigator.mediaDevices.addEventListener('devicechange', populateDevices);
  }

  // --- master volume: a downstream listening-convenience trim, separate
  // from any preset's own "Master" tone knob — never touches preset/engine
  // state, so it can't affect determinism or persisted tweaks. Hard-capped
  // at unity (never boosts): it sits after the engine's own hard-capped
  // master gain, so anything above 1 here would let the final output exceed
  // the safety ceiling the engine already promises (AGENTS.md §2). Clamp
  // defensively on both read and write, not just via the slider's max.
  if (monitorGain) {
    volumeSlider.value = String(clamp(monitorGain.gain.value, 0, 1));
    volumeSlider.addEventListener('input', () => {
      monitorGain.gain.value = clamp(parseFloat(volumeSlider.value), 0, 1);
    });
  } else {
    volumeSlider.disabled = true;
  }

  // --- input level meter: reflects whichever source (live mic or Listen
  // Mode riff) is currently feeding the chain.
  if (analyser) {
    const data = new Uint8Array(analyser.fftSize);
    (function drawLevel() {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      levelFill.style.width = Math.min(100, Math.round(peak * 140)) + '%';
      requestAnimationFrame(drawLevel);
    })();
  }

  return {
    refresh,
    showError,
    getSelectedDeviceId: () => (deviceSelect && deviceSelect.value) || undefined,
  };
}
