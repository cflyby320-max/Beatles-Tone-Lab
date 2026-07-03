// Tonestack, ported from js/amp.js:331-349 (node decls) + the pure cores of the
// bass/mid/treble/presence setters (DOM sync stripped). Serial order matches the
// base engine: treble -> bass -> mid -> presence.
export function createTonestack(context) {
  const trebleFilter = context.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 6500;
  trebleFilter.Q.value = 0.7071;

  const bassFilter = context.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 100;
  bassFilter.Q.value = 0.7071;

  const midFilter = context.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1700;
  midFilter.Q.value = 0.7071;

  const presenceFilter = context.createBiquadFilter();
  presenceFilter.type = 'peaking';
  presenceFilter.frequency.value = 3900;
  presenceFilter.Q.value = 0.7071;

  trebleFilter.connect(bassFilter);
  bassFilter.connect(midFilter);
  midFilter.connect(presenceFilter);

  const nodes = { trebleFilter, bassFilter, midFilter, presenceFilter };
  return { input: trebleFilter, output: presenceFilter, nodes };
}
