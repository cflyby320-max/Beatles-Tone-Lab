// Wires the UI pieces together around a constructed Engine.
import { renderPresetCard } from './presetCard.js';
import { initKnobs } from './knobs.js';
import { initListenMode } from './listenMode.js';
import { initStatusBar } from './statusBar.js';

export function initApp({ engine, preset, context, root }) {
  const card = root.querySelector('#preset-card');
  const knobs = root.querySelector('#knobs');
  const listen = root.querySelector('#listen');
  const status = root.querySelector('#status-bar');

  renderPresetCard(card, preset);
  initKnobs(knobs, engine, preset);
  const statusBar = initStatusBar(status, engine, context);
  initListenMode(listen, engine, preset, context, statusBar.showError);
}
