// FENDER_BLACKFACE voicing (PRD §2.3): scooped mids, high headroom, late soft
// clip — the reference voicing for Get Back's warm, dynamic, edge-of-breakup
// clean. This is a DATA + MAPPING module: it reuses the exact nodes built by the
// engine stages and only sets parameters. No new DSP, no graph topology.
//
// All numbers here are DRAFT approximations from documented gear facts (Casino
// hollow-body into a Fender Twin/Showman on the edge of breakup, minimal FX),
// to be refined by ear against the real recording.
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

  // --- preamp: warm, high-headroom voicing constants + the Gain knob ---
  const pre = n.preamp.nodes;
  pre.lowShelf1.gain.value = -6;
  pre.lowShelf2.gain.value = -3; // warmer low-mids than the metal-oriented base preset
  pre.lowShelf3.gain.value = -6;
  pre.preampStage1Gain.gain.value = lerp(p.preamp.gain, 1.0, 1.4);
  pre.preampStage2Gain.gain.value = 1.0;
  // Keep drive low across the whole knob range -> late/gentle breakup.
  n.preamp.setDrive(clamp(p.preamp.gain, 0, 1) * 5); // 0..5 on the 0..10 drive scale

  // --- tonestack ---
  const ts = n.tonestack.nodes;
  ts.trebleFilter.gain.value = lerp(p.tonestack.treble, -18, 9); // "Tone" knob
  ts.bassFilter.gain.value = lerp(p.tonestack.bass, -24, 6);
  ts.midFilter.gain.value = lerp(p.tonestack.mid, -18, 6); // scooped: default ~0.6 -> ~-3.6 dB
  ts.presenceFilter.gain.value = 2; // fixed presence lift (not exposed)

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

export const FENDER_BLACKFACE = { name: 'FENDER_BLACKFACE', apply };
