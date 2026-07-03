// Tiny pub/sub used to push engine-side state changes (preset applied, IR
// load/error, gate open/close) out to any listening UI, without the engine
// ever touching the DOM. Keeps the "no document in engine" rule intact.
export function createEmitter() {
  const listeners = new Map(); // event -> Set<fn>

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => off(event, fn);
  }

  function off(event, fn) {
    const set = listeners.get(event);
    if (set) set.delete(fn);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (e) {
        // A broken listener must never take down the audio engine.
        console.error('emitter listener for "' + event + '" threw:', e);
      }
    }
  }

  return { on, off, emit };
}
