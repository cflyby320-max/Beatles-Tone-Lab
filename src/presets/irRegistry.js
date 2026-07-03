// Maps preset IR ids to the impulse-response files under /public/irs.
// Preset JSON refers to IRs by id (e.g. "fender-cab-01"); the convolver looks
// them up by `name`, so id === name here.
export const cabinetImpulses = [
  { name: 'fender-cab-01', url: 'public/irs/cabinet/fender-cab-01.wav' },
];

export const reverbImpulses = [
  { name: 'plate-01', url: 'public/irs/reverb/plate-01.wav' },
];
