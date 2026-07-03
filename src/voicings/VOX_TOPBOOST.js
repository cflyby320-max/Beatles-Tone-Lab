// VOX_TOPBOOST voicing (PRD §2.3): bright cap character — presence lift ~2-4 kHz,
// earlier preamp breakup, chime. Reference voicing for the early Beatlemania/
// Revolver-era Vox AC30 Top Boost tones (I Saw Her Standing There, A Hard Day's
// Night, Taxman). Same DATA + MAPPING pattern as FENDER_BLACKFACE: no new DSP,
// no graph topology, only parameters on the existing engine nodes.
//
// All numbers here are DRAFT approximations from documented gear facts, to be
// refined by ear against the real recordings (see docs/tone-notes.md).
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

  // --- preamp: brighter, earlier-breakup voicing constants + the Gain knob ---
  const pre = n.preamp.nodes;
  pre.lowShelf1.gain.value = -6;
  pre.lowShelf2.gain.value = -1; // less low-mid cut than Fender -> thinner, chimier
  pre.lowShelf3.gain.value = -6;
  pre.preampStage1Gain.gain.value = lerp(p.preamp.gain, 1.0, 1.8); // wider gain swing -> breaks up sooner
  pre.preampStage2Gain.gain.value = 1.0;
  // Higher drive ceiling than FENDER_BLACKFACE -> the AC30's earlier chime/breakup.
  n.preamp.setDrive(clamp(p.preamp.gain, 0, 1) * 7); // 0..7 on the 0..10 drive scale

  // --- tonestack: brighter, less scooped than the Fender voicing ---
  const ts = n.tonestack.nodes;
  ts.trebleFilter.gain.value = lerp(p.tonestack.treble, -9, 12); // "Tone" knob, brighter range
  ts.bassFilter.gain.value = lerp(p.tonestack.bass, -24, 3); // tighter low end
  ts.midFilter.gain.value = lerp(p.tonestack.mid, -9, 9); // present, not scooped
  ts.presenceFilter.gain.value = 4; // fixed presence lift ~2-4 kHz (top-boost chime), not exposed

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

export const VOX_TOPBOOST = { name: 'VOX_TOPBOOST', apply };
