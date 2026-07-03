// Maps preset IR ids to the impulse-response files under /public/irs.
// Preset JSON refers to IRs by id (e.g. "fender-cab-01"); the convolver looks
// them up by `name`, so id === name here. URLs are root-absolute (leading
// "/") rather than page-relative: loadSample() does a plain fetch(), so a
// relative "public/..." only resolves from pages served at the site root
// (index.html) and 404s from test/determinism.html (served from /test/).
//
// "vox-cab-01" is a PLACEHOLDER: no dedicated Vox AC30 Blue-style cab IR has
// been sourced yet (PRD §2.4), so it reuses the same Fender cab file for now.
// Kept as a distinct named entry (rather than pointing VOX_TOPBOOST presets at
// "fender-cab-01" directly) so preset JSON stays honest about voicing intent
// once a real Vox IR lands. See CREDITS.md.
export const cabinetImpulses = [
  { name: 'fender-cab-01', url: '/public/irs/cabinet/fender-cab-01.wav' },
  { name: 'vox-cab-01', url: '/public/irs/cabinet/fender-cab-01.wav' },
];

export const reverbImpulses = [
  { name: 'plate-01', url: '/public/irs/reverb/plate-01.wav' },
];
