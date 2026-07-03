// Play Mode: live guitar via getUserMedia (PRD §2.1/§4/§5). Desktop Chrome +
// external audio interface is the happy path; permission-denied or no-device
// falls back gracefully to Listen Mode (never a broken/blank control). Mobile
// hides the Play control entirely (PRD §4: "Mobile: Play Mode toggle hidden").
// The controller is .mjs so its cancellation state machine can also run in
// Node CI (see listenMode.js for the same split).
export { createPlayMode } from './playModeController.mjs';

export function isMobile() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  const coarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const compactViewport =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 700px)').matches;
  return mobileUserAgent || coarsePointer || compactViewport;
}
