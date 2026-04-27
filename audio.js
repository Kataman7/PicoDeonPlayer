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
  Soundfont.instrument(audioCtx, name, { soundfont: 'FluidR3_GM' })
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

const playingNodes = new Map();

export function play(midi) {
  ensureAudioContext();
  if (!instrument && !isLoading) loadInstrument(currentInstrName);
  if (instrument) {
    if (playingNodes.has(midi)) {
      stop(midi);
    }
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);
    
    const node = instrument.play(midi, audioCtx.currentTime, { destination: gainNode });
    
    playingNodes.set(midi, { source: node, gain: gainNode });
  }
}

let fadeOutDuration = 0.2;

export function setFadeOutTime(seconds) {
  fadeOutDuration = Math.max(0, seconds);
}

export function stop(midi) {
  if (playingNodes.has(midi)) {
    const { source, gain } = playingNodes.get(midi);
    
    gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
    if (fadeOutDuration > 0) {
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + fadeOutDuration);
      source.stop(audioCtx.currentTime + fadeOutDuration);
    } else {
      source.stop(audioCtx.currentTime);
    }
    
    playingNodes.delete(midi);
  }
}

export function currentName() {
  return currentInstrName;
}