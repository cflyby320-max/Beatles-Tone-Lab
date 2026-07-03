// Slap-echo pedal (PRD §2.2): single short DelayNode with a feedback loop that
// contains BOTH a feedback gain (<= 0.25) and a lowpass filter, so repeats
// darken while the dry tap stays full-bandwidth. Off = wet muted (dry always
// passes), keeping "off" transparent.
import { clamp } from '../utils/clamp.js';

export function createSlapEcho(context) {
  const input = context.createGain();
  const output = context.createGain();
  const dry = context.createGain();
  const wet = context.createGain();
  const delay = context.createDelay(1.0);
  const feedback = context.createGain();
  const fbLpf = context.createBiquadFilter();

  delay.delayTime.value = 0.125; // 125 ms (110-140 ms range)
  feedback.gain.value = 0.18; // <= 0.25
  fbLpf.type = 'lowpass';
  fbLpf.frequency.value = 3200; // darken repeats, inside the loop only

  // dry
  input.connect(dry);
  dry.connect(output);
  // wet + feedback loop
  input.connect(delay);
  delay.connect(wet);
  wet.connect(output);
  delay.connect(fbLpf);
  fbLpf.connect(feedback);
  feedback.connect(delay);

  dry.gain.value = 1;
  wet.gain.value = 0; // start off

  function setOn(on) {
    wet.gain.value = on ? 0.5 : 0;
  }

  function setParams(p) {
    if (!p) return;
    if (p.time !== undefined) delay.delayTime.value = clamp(p.time, 0.11, 0.14);
    if (p.feedback !== undefined) feedback.gain.value = clamp(p.feedback, 0, 0.25);
  }

  return { input, output, setOn, setParams };
}
