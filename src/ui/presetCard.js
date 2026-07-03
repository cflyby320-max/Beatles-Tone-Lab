// Renders the museum-placard preset card entirely from preset JSON — no tone
// copy is hardcoded in HTML.
export function renderPresetCard(container, preset) {
  const gearChain = [
    preset.gear.guitar,
    ...(preset.gear.pedals && preset.gear.pedals.length ? preset.gear.pedals : []),
    preset.gear.amp,
    'Cabinet',
  ];

  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML =
    '<h2 class="song">' +
    escapeHtml(preset.song) +
    '</h2>' +
    '<span class="era-badge">' +
    escapeHtml(preset.album) +
    ' · ' +
    preset.year +
    '</span>' +
    (preset.status === 'draft' ? '<span class="draft-badge">draft tone</span>' : '');
  container.appendChild(header);

  const chain = document.createElement('div');
  chain.className = 'gear-chain';
  chain.setAttribute('aria-label', 'Signal chain');
  gearChain.forEach((item, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'chain-arrow';
      arrow.textContent = '→';
      chain.appendChild(arrow);
    }
    const chip = document.createElement('span');
    chip.className = 'gear-chip';
    chip.textContent = item;
    chain.appendChild(chip);
  });
  container.appendChild(chain);

  const story = document.createElement('p');
  story.className = 'story';
  story.textContent = preset.story;
  container.appendChild(story);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
