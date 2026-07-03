// Power-amp stage (PRD §2.1: "gain + soft-clip waveshaper"). The base engine had
// no distinct power-amp block — it used a single post-preamp `outputGain`. Here
// we add a gentle soft-clip after that gain so the "drive" knob has some late,
// musical breakup. Documented as an APPROXIMATION of true power-amp sag/
// compression, not a physical model.
import { kFromDrive } from './waveshapers.js';

export function createPowerAmp(context, waveshapers) {
  const outputGain = context.createGain();
  outputGain.gain.value = 0.7; // matches base engine default (changeOutputGain(7))

  const softClip = context.createWaveShaper();
  softClip.curve = waveshapers.curves.standard(kFromDrive(0));

  outputGain.connect(softClip);

  // drive in [0, 1] -> modest gain + a low, late-clipping k.
  function setDrive(driveNormalized) {
    const d = Math.max(0, Math.min(1, Number(driveNormalized) || 0));
    outputGain.gain.value = 0.4 + d * 0.6; // 0.4 .. 1.0
    // Keep the power amp mostly clean; only the top of the drive range clips.
    softClip.curve = waveshapers.curves.standard(kFromDrive(d * 3));
  }

  const nodes = { outputGain, softClip };
  return { input: outputGain, output: softClip, nodes, setDrive };
}
