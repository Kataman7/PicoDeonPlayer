import { INSTRUMENTS } from './notes.js';
import * as audio from './audio.js';
import * as keyboard from './keyboard.js';
import * as midi from './midi.js';

const SIZE_KEY = 'picodeon-key-scale';
const SIZE_DEFAULT = 100;
const SIZE_MIN = 50;
const SIZE_MAX = 150;
const SIZE_STEP = 10;

const activeNotes = new Set();

const selSound = document.getElementById('soundSelect');
const selInput = document.getElementById('midiInput');
const statusEl = document.getElementById('status');
const midiStatusEl = document.getElementById('midiStatus');
const sizeSlider = document.getElementById('sizeSlider');
const sizeInput = document.getElementById('sizeInput');
const sizeReset = document.getElementById('sizeReset');

function applySize(val) {
  const clamped = Math.round(Math.min(SIZE_MAX, Math.max(SIZE_MIN, val)) / SIZE_STEP) * SIZE_STEP;
  const scale = clamped / 100;
  document.documentElement.style.setProperty('--key-scale', scale);
  sizeSlider.value = clamped;
  sizeInput.value = clamped;
  localStorage.setItem(SIZE_KEY, String(clamped));
}

function loadSavedSize() {
  const saved = localStorage.getItem(SIZE_KEY);
  if (saved) {
    const num = parseInt(saved, 10);
    if (!isNaN(num)) return Math.min(SIZE_MAX, Math.max(SIZE_MIN, num));
  }
  return SIZE_DEFAULT;
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

function setMidiStatus(msg, hasDevice) {
  midiStatusEl.textContent = msg;
  midiStatusEl.classList.toggle('no-device', !hasDevice);
}

function noteOn(midi) {
  if (activeNotes.has(midi)) return;
  activeNotes.add(midi);
  audio.play(midi);
  keyboard.highlightOn(midi);
}

function noteOff(midi) {
  if (!activeNotes.has(midi)) return;
  activeNotes.delete(midi);
  audio.stop(midi);
  keyboard.highlightOff(midi);
}

function handleMidiNote(midi, isOn) {
  if (isOn) noteOn(midi);
  else noteOff(midi);
}

function populateSoundSelect() {
  selSound.innerHTML = '';
  Object.entries(INSTRUMENTS).forEach(([key, label]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    selSound.appendChild(opt);
  });
  selSound.value = 'accordion';
}

function clearActiveNotes() {
  activeNotes.clear();
  keyboard.clearAllHighlights();
}

function onSoundChange() {
  clearActiveNotes();
  audio.loadInstrument(selSound.value);
}

function onInputChange() {
  const name = midi.connectInput(selInput.value);
  if (name) setMidiStatus('Connected: ' + name, true);
  else setMidiStatus('', true);
}

function onDevicesChanged(hasDevice) {
  if (!hasDevice) setMidiStatus('No PicoDeon detected', false);
  else if (!selInput.value) setMidiStatus('Select your PicoDeon', true);
}

sizeSlider.addEventListener('input', () => applySize(parseInt(sizeSlider.value, 10)));

sizeInput.addEventListener('change', () => {
  const val = parseInt(sizeInput.value, 10);
  if (isNaN(val)) applySize(SIZE_DEFAULT);
  else applySize(val);
});
sizeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sizeInput.blur();
});

sizeReset.addEventListener('click', () => applySize(SIZE_DEFAULT));

midi.setOnMessage(handleMidiNote);
midi.setOnDevicesChanged(onDevicesChanged);

populateSoundSelect();
audio.init(setStatus);
audio.loadInstrument('accordion');
keyboard.build(document.getElementById('keyboard'), noteOn, noteOff);

selSound.addEventListener('change', onSoundChange);
selInput.addEventListener('change', onInputChange);

applySize(loadSavedSize());
setStatus('Click a key to start');
midi.init(
  () => setMidiStatus('Web MIDI not supported', false),
  err => setMidiStatus('MIDI access denied', false)
);