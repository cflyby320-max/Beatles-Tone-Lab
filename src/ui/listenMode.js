// Listen Mode: loop a bundled dry riff through the live engine graph (PRD §4).
// One shared graph — Listen Mode just feeds engine.input. AudioContext is
// resumed on the first user gesture (autoplay policy).
export function initListenMode(container, engine, preset, context, onError) {
  container.innerHTML = '';

  const button = document.createElement('button');
  button.className = 'play-toggle';
  button.type = 'button';
  button.textContent = '▶ Listen';

  const audio = document.createElement('audio');
  audio.loop = true;
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  // demoRiff is repo-root-relative; sibling .ogg is a fallback source.
  const mp3 = document.createElement('source');
  mp3.src = preset.demoRiff;
  mp3.type = 'audio/mpeg';
  const ogg = document.createElement('source');
  ogg.src = preset.demoRiff.replace(/\.mp3$/, '.ogg');
  ogg.type = 'audio/ogg';
  audio.appendChild(mp3);
  audio.appendChild(ogg);

  audio.addEventListener('error', () => {
    if (onError) onError('Demo riff failed to load: ' + preset.demoRiff);
  });

  let sourceNode = null;
  let playing = false;

  async function toggle() {
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch (e) {
        if (onError) onError('Could not start audio: ' + e.message);
        return;
      }
    }
    if (!sourceNode) {
      // createMediaElementSource may only be called once per element.
      sourceNode = context.createMediaElementSource(audio);
      sourceNode.connect(engine.input);
    }
    if (!playing) {
      try {
        await audio.play();
        playing = true;
        button.textContent = '❚❚ Pause';
        button.classList.add('playing');
      } catch (e) {
        if (onError) onError('Playback blocked: ' + e.message);
      }
    } else {
      audio.pause();
      playing = false;
      button.textContent = '▶ Listen';
      button.classList.remove('playing');
    }
  }

  button.addEventListener('click', toggle);
  container.appendChild(button);

  return { audio };
}
