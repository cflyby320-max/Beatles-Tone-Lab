// Leslie/vibrato pedal (PRD §2.2): chorus-style modulated DelayNode (pitch
// vibrato) + amplitude tremolo + light stereo spread. Needed for Lucy in the
// Sky. Bypass is a hard dry/wet reroute (dry=1/wet=0 when off), same pattern
// as the other pedals.
//
// L/R channels run 180 degrees out of phase off a SINGLE shared LFO (via a -1
// inverting gain) rather than two independent oscillators. That keeps the
// stereo spread fully deterministic under OfflineAudioContext -- two
// free-running oscillators would still be individually deterministic, but
// tying them to one source removes any chance of drift and is simpler.
export function createLeslie(context) {
  const input = context.createGain();
  const output = context.createGain();
  const dry = context.createGain();
  const wet = context.createGain();

  input.connect(dry);
  dry.connect(output);

  const ROTOR_HZ = 5.5; // draft "fast" rotor speed (slow/fast switch not exposed in v1)
  const PITCH_DEPTH_S = 0.0025; // vibrato delay-time swing, seconds
  const TREM_DEPTH = 0.28; // amplitude modulation depth
  const BASE_DELAY_S = 0.01;
  const PAN_SPREAD = 0.5;

  const lfo = context.createOscillator();
  lfo.frequency.value = ROTOR_HZ;
  const inverted = context.createGain();
  inverted.gain.value = -1;
  lfo.connect(inverted);

  function makeChannel(lfoSource, panValue) {
    const delay = context.createDelay(0.05);
    delay.delayTime.value = BASE_DELAY_S;
    const pitchDepth = context.createGain();
    pitchDepth.gain.value = PITCH_DEPTH_S;
    lfoSource.connect(pitchDepth);
    pitchDepth.connect(delay.delayTime);

    const trem = context.createGain();
    trem.gain.value = 1;
    const tremDepth = context.createGain();
    tremDepth.gain.value = TREM_DEPTH;
    lfoSource.connect(tremDepth);
    tremDepth.connect(trem.gain);

    const pan = context.createStereoPanner();
    pan.pan.value = panValue;

    delay.connect(trem);
    trem.connect(pan);
    return { input: delay, output: pan };
  }

  const left = makeChannel(lfo, -PAN_SPREAD);
  const right = makeChannel(inverted, PAN_SPREAD);

  input.connect(left.input);
  input.connect(right.input);
  left.output.connect(wet);
  right.output.connect(wet);

  // start bypassed
  dry.gain.value = 1;
  wet.gain.value = 0;

  lfo.start();

  function setOn(on) {
    dry.gain.value = on ? 0 : 1;
    wet.gain.value = on ? 1 : 0;
  }

  return { input, output, setOn };
}
