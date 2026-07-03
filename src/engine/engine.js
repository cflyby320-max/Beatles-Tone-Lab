// Engine — the headless orchestrator. Owns the signal chain and the current
// param state, applies presets/voicings, and maps the 4 exposed knobs onto the
// underlying params. Emits state changes; never touches the DOM.
import { createSignalChain } from './signalChain.js';
import { createEmitter } from './utils/emitter.js';
import { voicings } from '../voicings/index.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getDeep(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setDeep(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}

export class Engine {
  constructor(context, options) {
    this.context = context;
    this.emitter = createEmitter();
    this.chain = createSignalChain(context, {
      cabinetImpulses: options.cabinetImpulses,
      reverbImpulses: options.reverbImpulses,
      emitter: this.emitter,
    });
    this.input = this.chain.input;
    this.output = this.chain.output;
    this.output.connect(context.destination);

    this.currentParams = null;
    this.voicing = null;
    this.exposedKnobs = [];
  }

  // Resolves once the cabinet + reverb IRs have loaded (or failed). Callers that
  // need a deterministic graph before rendering (the offline determinism test)
  // await this first.
  whenReady() {
    return this.chain.whenReady;
  }

  on(event, fn) {
    return this.emitter.on(event, fn);
  }

  off(event, fn) {
    this.emitter.off(event, fn);
  }

  // Applies a preset fully and deterministically: every param is set, so no
  // state leaks in from a previously-loaded preset. Returns a promise that
  // resolves once any cabinet/reverb IR switch this triggered has finished
  // loading+decoding — callers that need a fully settled graph before
  // proceeding (offline renders in particular) should await it; UI callers
  // that just want the knobs to move can ignore the return value.
  applyPreset(preset) {
    const voicing = voicings[preset.voicing];
    if (!voicing) throw new Error('Unknown voicing: ' + preset.voicing);
    this.voicing = voicing;
    this.currentParams = clone(preset.params);
    this.exposedKnobs = Array.isArray(preset.exposedKnobs) ? preset.exposedKnobs.slice() : [];
    this.voicing.apply(this.chain, this.currentParams);
    this.emitter.emit('preset-applied', {
      preset,
      exposed: this.getExposedKnobValues(),
    });
    return this.chain.whenIRsSettled();
  }

  // Sets one underlying param (an exposedKnobs path) and re-applies the voicing.
  // Re-applying everything is cheap and guarantees the graph stays consistent.
  // Returns the same IR-settling promise as applyPreset(), for the same reason.
  setKnob(path, value) {
    if (!this.currentParams) throw new Error('setKnob before applyPreset');
    setDeep(this.currentParams, path, value);
    this.voicing.apply(this.chain, this.currentParams);
    this.emitter.emit('knob', { path, value });
    return this.chain.whenIRsSettled();
  }

  getKnob(path) {
    return getDeep(this.currentParams, path);
  }

  getExposedKnobValues() {
    return this.exposedKnobs.map((path) => ({ path, value: getDeep(this.currentParams, path) }));
  }
}
