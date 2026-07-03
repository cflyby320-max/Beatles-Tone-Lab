// Timeline strip (PRD §5.1/§7, UI design doc §4.5): 5 era segments pinned
// above the preset grid. Selecting an era (a) swaps the era token set via a
// class on #app, (b) filters visible preset cards to that era. Both complete
// within the PRD's 200ms budget via a CSS color transition, not a re-render.
import { ERAS } from './eraThemes.js';

export function initTimeline(container, { root, initialEra, onEraChange }) {
  container.innerHTML = '';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Era');

  let current = initialEra;
  const buttons = new Map();

  function setEra(eraId) {
    if (eraId === current) return;
    current = eraId;
    root.className = 'era-' + eraId;
    buttons.forEach((btn, id) => {
      const active = id === eraId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
    });
    if (onEraChange) onEraChange(eraId);
  }

  ERAS.forEach((era) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'era-segment';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(era.id === current));
    btn.tabIndex = era.id === current ? 0 : -1;
    if (era.id === current) btn.classList.add('active');

    const label = document.createElement('span');
    label.className = 'era-segment-label';
    label.textContent = era.label;
    const name = document.createElement('span');
    name.className = 'era-segment-name';
    name.textContent = era.name;

    btn.appendChild(label);
    btn.appendChild(name);
    btn.addEventListener('click', () => setEra(era.id));

    container.appendChild(btn);
    buttons.set(era.id, btn);
  });

  // Left/right arrow keys move focus between segments (roving tabindex,
  // standard tablist keyboard pattern).
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const ids = ERAS.map((era) => era.id);
    const idx = ids.indexOf(current);
    const next = e.key === 'ArrowRight' ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
    setEra(ids[next]);
    buttons.get(ids[next]).focus();
    e.preventDefault();
  });

  return { setEra, getEra: () => current };
}
