import { INSTRUMENTS } from './notes.js';

let audioCtx = null;
let instrument = null;
let currentInstrName = null;
let isLoading = false;
let loadSeq = 0;
let onStatus = null;

function ensureAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function init(statusCallback) {
  onStatus = statusCallback;
}

export function loadInstrument(name) {
  if (name === currentInstrName && (instrument || isLoading)) return;
  currentInstrName = name;
  instrument = null;
  isLoading = true;
  const thisSeq = ++loadSeq;
  ensureAudioContext();
  onStatus(`Loading ${INSTRUMENTS[name]}\u2026`);
  Soundfont.instrument(audioCtx, name, { soundfont: 'MusyngKite' })
    .then(inst => {
      if (loadSeq !== thisSeq) return;
      instrument = inst;
      isLoading = false;
      onStatus(`${INSTRUMENTS[name]} ready`);
    })
    .catch(() => {
      if (loadSeq !== thisSeq) return;
      isLoading = false;
      onStatus(`Failed to load ${INSTRUMENTS[name]}`, true);
    });
}

export function play(midi) {
  ensureAudioContext();
  if (!instrument && !isLoading) loadInstrument(currentInstrName);
  if (instrument) instrument.play(midi);
}

export function stop() {}

export function currentName() {
  return currentInstrName;
}