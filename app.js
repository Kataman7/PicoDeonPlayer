import { INSTRUMENTS } from './notes.js';
import * as audio from './audio.js';
import * as keyboard from './keyboard.js';
import * as midi from './midi.js';

const DEFAULT_INSTRUMENT = 'accordion';

const SIZE_KEY = 'picodeon-key-scale';
const SIZE_DEFAULT = 100;
const SIZE_MIN = 50;
const SIZE_MAX = 150;
const SIZE_STEP = 10;

const RELEASE_KEY = 'picodeon-release-time';
const RELEASE_DEFAULT = 0.2;
const RELEASE_MIN = 0;
const RELEASE_MAX = 1;

const LOOP_KEY = 'picodeon-loop';

const activeNotes = new Set();
let currentInstrumentKey = DEFAULT_INSTRUMENT;

const currentInstrumentLabel = getElement('currentInstrumentLabel');
const btnInstrument = getElement('btnInstrument');
const instrumentModal = getElement('instrumentModal');
const mainApp = getElement('mainApp');
const instrumentSearch = getElement('instrumentSearch');
const btnCloseModal = getElement('btnCloseModal');
const instrumentGrid = getElement('instrumentGrid');
const selInput = getElement('midiInput');
const statusEl = getElement('status');
const midiStatusEl = getElement('midiStatus');
const sizeSlider = getElement('sizeSlider');
const sizeInput = getElement('sizeInput');
const sizeReset = getElement('sizeReset');
const releaseSlider = getElement('releaseSlider');
const releaseInput = getElement('releaseInput');
const releaseReset = getElement('releaseReset');
const loopToggle = getElement('loopToggle');
const landingScreen = getElement('landingScreen');

function getElement(id) {
  return document.getElementById(id);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseIntOrDefault(raw, fallback) {
  const num = parseInt(raw, 10);
  return isNaN(num) ? fallback : num;
}

function parseFloatOrDefault(raw, fallback) {
  const num = parseFloat(raw);
  return isNaN(num) ? fallback : num;
}

function storeBoolean(key, value) {
  localStorage.setItem(key, value ? '1' : '0');
}

function loadBoolean(key) {
  return localStorage.getItem(key) === '1';
}

function storeNumber(key, value) {
  localStorage.setItem(key, String(value));
}

function loadNumber(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? parseFloatOrDefault(raw, fallback) : fallback;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function applySize(val) {
  const clamped = roundToStep(clamp(val, SIZE_MIN, SIZE_MAX), SIZE_STEP);
  const scale = clamped / 100;
  document.documentElement.style.setProperty('--key-scale', scale);
  sizeSlider.value = clamped;
  sizeInput.value = clamped;
  storeNumber(SIZE_KEY, clamped);
}

function loadSavedSize() {
  const saved = loadNumber(SIZE_KEY, SIZE_DEFAULT);
  return clamp(saved, SIZE_MIN, SIZE_MAX);
}

function applyRelease(val) {
  const clamped = clamp(val, RELEASE_MIN, RELEASE_MAX);
  releaseSlider.value = clamped;
  releaseInput.value = clamped;
  storeNumber(RELEASE_KEY, clamped);
  audio.setFadeOutTime(clamped);
}

function loadSavedRelease() {
  const saved = loadNumber(RELEASE_KEY, RELEASE_DEFAULT);
  return clamp(saved, RELEASE_MIN, RELEASE_MAX);
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

function clearGrid() {
  instrumentGrid.innerHTML = '';
}

function matchesSearch(key, label, query) {
  return label.toLowerCase().includes(query) || key.toLowerCase().includes(query);
}

function createInstrumentTile(key, label) {
  const btn = document.createElement('button');
  const isActive = key === currentInstrumentKey;
  btn.className = `instrument-tile${isActive ? ' active' : ''}`;
  btn.textContent = label;
  return btn;
}

function renderInstrumentTile(key, label) {
  const tile = createInstrumentTile(key, label);
  tile.addEventListener('click', () => selectInstrument(key, label));
  instrumentGrid.appendChild(tile);
}

function populateInstrumentGrid(filterText = '') {
  clearGrid();
  const query = filterText.toLowerCase();

  Object.entries(INSTRUMENTS).forEach(([key, label]) => {
    if (matchesSearch(key, label, query)) {
      renderInstrumentTile(key, label);
    }
  });
}

function selectInstrument(key, label) {
  currentInstrumentKey = key;
  currentInstrumentLabel.textContent = label;
  clearActiveNotes();
  audio.loadInstrument(key);
  closeModal();
}

function openModal() {
  mainApp.classList.add('hidden-view');
  instrumentModal.classList.remove('hidden-view');
  instrumentSearch.value = '';
  populateInstrumentGrid();
  instrumentSearch.focus();
}

function closeModal() {
  instrumentModal.classList.add('hidden-view');
  mainApp.classList.remove('hidden-view');
}

function clearActiveNotes() {
  activeNotes.clear();
  keyboard.clearAllHighlights();
}

function onInputChange() {
  const name = midi.connectInput(selInput.value);
  if (name) setMidiStatus(`Connected: ${name}`, true);
  else setMidiStatus('', true);
}

function onDevicesChanged(hasDevice) {
  if (!selInput.value) {
    setMidiStatus('No PicoDeon detected', false);
  } else {
    onInputChange();
  }
}

function initKeyboard() {
  keyboard.build(getElement('keyboard'), noteOn, noteOff);
}

function initAudio() {
  audio.init(setStatus);
  audio.loadInstrument(DEFAULT_INSTRUMENT);
}

function initMidi() {
  midi.init(
    () => setMidiStatus('Web MIDI not supported', false),
    () => setMidiStatus('MIDI access denied', false)
  );
}

function startGame() {
  landingScreen.classList.add('hidden');
  document.body.classList.add('playing');
  setTimeout(() => {
    initKeyboard();
    initAudio();
    initMidi();
  }, 100);
}

function blurOnEnter(event) {
  if (event.key === 'Enter') event.target.blur();
}

function wireSizeControls() {
  sizeSlider.addEventListener('input', () => applySize(parseInt(sizeSlider.value, 10)));
  sizeInput.addEventListener('change', () => {
    const val = parseIntOrDefault(sizeInput.value, SIZE_DEFAULT);
    applySize(val);
  });
  sizeInput.addEventListener('keydown', blurOnEnter);
  sizeReset.addEventListener('click', () => applySize(SIZE_DEFAULT));
}

function wireReleaseControls() {
  releaseSlider.addEventListener('input', () => applyRelease(parseFloat(releaseSlider.value)));
  releaseInput.addEventListener('change', () => {
    const val = parseFloatOrDefault(releaseInput.value, RELEASE_DEFAULT);
    applyRelease(val);
  });
  releaseInput.addEventListener('keydown', blurOnEnter);
  releaseReset.addEventListener('click', () => applyRelease(RELEASE_DEFAULT));
}

function applyLoop(enabled) {
  loopToggle.checked = enabled;
  storeBoolean(LOOP_KEY, enabled);
  audio.setLoopMode(enabled);
}

function wireLoopControl() {
  loopToggle.addEventListener('change', () => applyLoop(loopToggle.checked));
}

function wireMidi() {
  midi.setOnMessage(handleMidiNote);
  midi.setOnDevicesChanged(onDevicesChanged);
  selInput.addEventListener('change', onInputChange);
}

function wireModal() {
  btnInstrument.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  instrumentSearch.addEventListener('input', (e) => populateInstrumentGrid(e.target.value));
}

function wireEvents() {
  wireSizeControls();
  wireReleaseControls();
  wireLoopControl();
  wireMidi();
  wireModal();
  landingScreen.addEventListener('click', startGame);
}

function restoreSettings() {
  applySize(loadSavedSize());
  applyRelease(loadSavedRelease());
  applyLoop(loadBoolean(LOOP_KEY));
}

wireEvents();
restoreSettings();
setStatus('Click a key to start');