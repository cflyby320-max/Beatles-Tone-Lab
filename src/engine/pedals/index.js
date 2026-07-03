// PedalBoard — fixed slot order in v1 (PRD §2.2):
//   input -> compressor -> fuzz -> leslie -> slapEcho -> output
// Each pedal exposes { input, output, setOn }. setState() applies a preset's
// `params.pedals` block exhaustively so nothing leaks between presets.
import { createCompressor } from './compressor.js';
import { createFuzz } from './fuzz.js';
import { createLeslie } from './leslie.js';
import { createSlapEcho } from './slapEcho.js';

export function createPedalBoard(context) {
  const input = context.createGain();
  const output = context.createGain();

  const compressor = createCompressor(context);
  const fuzz = createFuzz(context);
  const leslie = createLeslie(context);
  const slapEcho = createSlapEcho(context);

  // wire the fixed chain
  input.connect(compressor.input);
  compressor.output.connect(fuzz.input);
  fuzz.output.connect(leslie.input);
  leslie.output.connect(slapEcho.input);
  slapEcho.output.connect(output);

  const pedals = { compressor, fuzz, leslie, slapEcho };

  function setState(pedalParams) {
    // Always set every slot (default off) — exhaustive, no leakage.
    compressor.setOn(!!(pedalParams && pedalParams.compressor && pedalParams.compressor.on));
    fuzz.setOn(!!(pedalParams && pedalParams.fuzz && pedalParams.fuzz.on));
    leslie.setOn(!!(pedalParams && pedalParams.leslie && pedalParams.leslie.on));
    const slap = pedalParams && pedalParams.slapEcho;
    slapEcho.setOn(!!(slap && slap.on));
    if (slap) slapEcho.setParams(slap);
  }

  return { input, output, setState, pedals };
}
