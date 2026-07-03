// Assembles the full signal graph (PRD §2.1), ported from Amp()/buildGraph()
// (js/amp.js:220-467) with all DOM coupling removed. Order:
//
//   input -> inputGain -> noiseGate -> pedalBoard -> boost -> preamp
//     -> tonestack -> powerAmp -> cabinet(IR) -> reverb(IR) -> master -> output
//
// Dropped from the base engine as dead weight for this slice: the 6-band graphic
// Equalizer, the whole-amp bypass path, and curve-drawing visualizations.
import { createWaveShapers } from './waveshapers.js';
import { createNoiseGate } from './noiseGate.js';
import { createPedalBoard } from './pedals/index.js';
import { createBoost } from './boost.js';
import { createPreamp } from './preamp.js';
import { createTonestack } from './tonestack.js';
import { createPowerAmp } from './powerAmp.js';
import { createConvolver } from './convolver.js';

export function createSignalChain(context, options) {
  const { cabinetImpulses, reverbImpulses, emitter } = options;
  const waveshapers = createWaveShapers();

  const input = context.createGain();
  const inputGain = context.createGain();
  inputGain.gain.value = 1;

  const gate = createNoiseGate(context, emitter);
  const pedalBoard = createPedalBoard(context);
  const boost = createBoost(context);
  const preamp = createPreamp(context, waveshapers);
  const tonestack = createTonestack(context);
  const powerAmp = createPowerAmp(context, waveshapers);
  const cabinet = createConvolver(context, cabinetImpulses, emitter, 'cabinet');
  const reverb = createConvolver(context, reverbImpulses, emitter, 'reverb');
  const master = context.createGain();
  master.gain.value = 0.8;

  const output = context.createGain();

  // wire it all up
  input.connect(inputGain);
  inputGain.connect(gate.input);
  gate.output.connect(pedalBoard.input);
  pedalBoard.output.connect(boost.input);
  boost.output.connect(preamp.input);
  preamp.output.connect(tonestack.input);
  tonestack.output.connect(powerAmp.input);
  powerAmp.output.connect(cabinet.input);
  cabinet.output.connect(reverb.input);
  reverb.output.connect(master);
  master.connect(output);

  const nodes = {
    inputGain,
    gate,
    pedalBoard,
    boost,
    preamp,
    tonestack,
    powerAmp,
    cabinet,
    reverb,
    master,
  };

  // resolves once both convolvers' initial IRs are loaded (or have failed)
  const whenReady = Promise.all([cabinet.ready, reverb.ready]).then(() => undefined);

  // resolves once any IR switch most recently triggered on either convolver
  // (e.g. by applying a preset that names a different cabinet.ir/reverb.ir)
  // has finished loading+decoding, or failed. Callers that need the graph
  // fully settled before proceeding — offline renders in particular — must
  // await this after applyPreset()/setKnob(), since loadImpulseByName() is
  // fire-and-forget from inside a voicing's synchronous apply().
  function whenIRsSettled() {
    return Promise.all([cabinet.whenSettled(), reverb.whenSettled()]).then(() => undefined);
  }

  return { input, output, nodes, waveshapers, whenReady, whenIRsSettled };
}
