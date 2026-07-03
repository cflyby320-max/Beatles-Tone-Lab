// Fetch + decode an audio file into an AudioBuffer.
// Ported from the base repo's js/utils.js:loadSample, which had NO error
// handling at all (a failed fetch or decode silently left the graph broken —
// PRD §8.5). This version rejects on every failure path so callers can surface
// an error state.
export function loadSample(audioContext, url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' fetching ' + url);
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      // decodeAudioData returns a promise in modern browsers; wrap the
      // callback form too for broader compatibility.
      return new Promise((resolve, reject) => {
        const maybePromise = audioContext.decodeAudioData(
          arrayBuffer,
          (decoded) => resolve(decoded),
          (err) => reject(err || new Error('decodeAudioData failed for ' + url))
        );
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(resolve, reject);
        }
      });
    });
}
