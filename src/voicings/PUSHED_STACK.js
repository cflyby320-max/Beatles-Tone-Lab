// PUSHED_STACK voicing (PRD §2.3): the base engine's JCM-ish curve retained for
// the heaviest preset — a cranked stack, humbucker-driven, fuzz-and-drive-
// stacked chaos (Helter Skelter). Same DATA + MAPPING pattern as the other two
// voicings: no new DSP, no graph topology, only parameters on the existing
// engine nodes.
//
// All numbers here are DRAFT approximations, to be refined by ear against the
// real recording (see docs/tone-notes.md).
import { clamp, lerp } from '../engine/utils/clamp.js';

const MAX_MASTER_GAIN = 2; // hard cap (matches base engine's default headroom)
const CABINET_MIX = 0.85; // mostly-wet cabinet IR (fixed voicing constant)

function apply(chain, p) {
  const n = chain.nodes;

  // --- input + gate + pedals ---
  n.inputGain.gain.value = clamp(p.inputGain, 0, 2);
  n.gate.setThreshold(p.gate.threshold);
  n.pedalBoard.setState(p.pedals);
  n.boost.onOff(false); // boost stays transparent in this voicing

  // --- preamp: tight low end, big gain swing for a cranked-stack feel ---
  const pre = n.preamp.nodes;
  pre.lowShelf1.gain.value = -6;
  pre.lowShelf2.gain.value = -8; // cut low-mids harder -> tight, not boomy, under heavy drive
  pre.lowShelf3.gain.value = -6;
  pre.preampStage1Gain.gain.value = lerp(p.preamp.gain, 1.0, 2.4); // widest gain swing of the 3 voicings
  pre.preampStage2Gain.gain.value = 1.0;
  // Highest drive ceiling -> the loud, saturated, chaotic character.
  n.preamp.setDrive(clamp(p.preamp.gain, 0, 1) * 9); // 0..9 on the 0..10 drive scale

  // --- tonestack: present mids (not scooped), tight-but-full low end ---
  const ts = n.tonestack.nodes;
  ts.trebleFilter.gain.value = lerp(p.tonestack.treble, -6, 12); // "Tone" knob
  ts.bassFilter.gain.value = lerp(p.tonestack.bass, -18, 9);
  ts.midFilter.gain.value = lerp(p.tonestack.mid, -6, 15); // aggressive midrange push
  ts.presenceFilter.gain.value = 3; // fixed presence lift, not exposed

  // --- power amp (approximate sag) ---
  n.powerAmp.setDrive(p.powerAmp.drive);

  // --- cabinet + reverb (only (re)load an IR when the name actually changes,
  //     so turning a knob never triggers a redundant fetch/decode) ---
  if (n.cabinet.getName() !== p.cabinet.ir) n.cabinet.loadImpulseByName(p.cabinet.ir);
  n.cabinet.setGain(CABINET_MIX);
  if (n.reverb.getName() !== p.reverb.ir) n.reverb.loadImpulseByName(p.reverb.ir);
  n.reverb.setGain(clamp(p.reverb.mix, 0, 1));

  // --- master (hard-capped) ---
  n.master.gain.value = clamp(p.master, 0, 1) * MAX_MASTER_GAIN;
}

export const PUSHED_STACK = { name: 'PUSHED_STACK', apply };
