// Preamp stage, ported from the node declarations in js/amp.js:274-325 plus the
// pure audio-mutation cores of the change* setters (DOM sync stripped).
// Topology (unchanged from the base engine):
//   lowShelf1 -> lowShelf2 -> preampStage1Gain -> od[0](asymetric)
//   -> highPass1(DC blocker) -> lowShelf3 -> preampStage2Gain -> od[1](standard)
import { kFromDrive } from './waveshapers.js';

// Fixed two-stage curve identities (base engine defaults). The voicing varies
// the *drive amount* (k), never the curve names.
const DISTO_TYPES = ['asymetric', 'standard'];

export function createPreamp(context, waveshapers) {
  const lowShelf1 = context.createBiquadFilter();
  lowShelf1.type = 'lowshelf';
  lowShelf1.frequency.value = 720;
  lowShelf1.gain.value = -6;

  const lowShelf2 = context.createBiquadFilter();
  lowShelf2.type = 'lowshelf';
  lowShelf2.frequency.value = 320;
  lowShelf2.gain.value = -5;

  const preampStage1Gain = context.createGain();
  preampStage1Gain.gain.value = 1.0;

  const od0 = context.createWaveShaper();
  od0.curve = waveshapers.curves[DISTO_TYPES[0]](0);

  const highPass1 = context.createBiquadFilter();
  highPass1.type = 'highpass';
  highPass1.frequency.value = 6;
  highPass1.Q.value = 0.7071;

  const lowShelf3 = context.createBiquadFilter();
  lowShelf3.type = 'lowshelf';
  lowShelf3.frequency.value = 720;
  lowShelf3.gain.value = -6;

  const preampStage2Gain = context.createGain();
  preampStage2Gain.gain.value = 1.0;

  const od1 = context.createWaveShaper();
  od1.curve = waveshapers.curves[DISTO_TYPES[1]](0);

  // wire stages
  lowShelf1.connect(lowShelf2);
  lowShelf2.connect(preampStage1Gain);
  preampStage1Gain.connect(od0);
  od0.connect(highPass1);
  highPass1.connect(lowShelf3);
  lowShelf3.connect(preampStage2Gain);
  preampStage2Gain.connect(od1);

  // Recompute both waveshaper curves for a 0..10 drive slider (ported from
  // changeDistorsionValues / changeDrive, js/amp.js:800-858, DOM removed).
  function setDrive(sliderValue) {
    const k = kFromDrive(sliderValue);
    od0.curve = waveshapers.curves[DISTO_TYPES[0]](k);
    od1.curve = waveshapers.curves[DISTO_TYPES[1]](k);
  }

  const nodes = {
    lowShelf1,
    lowShelf2,
    preampStage1Gain,
    od0,
    highPass1,
    lowShelf3,
    preampStage2Gain,
    od1,
  };

  return { input: lowShelf1, output: od1, nodes, setDrive };
}
