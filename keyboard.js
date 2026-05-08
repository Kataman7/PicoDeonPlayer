import { LAYOUT, parseNoteName, midiToName, midiToSolfege, isBlackKey } from './notes.js';

const STAGGER_STEP = 0.04;

let keyboardEl = null;
let _onNoteOn = null;
let _onNoteOff = null;
const activePointers = new Map();

function calculateStaggerDelay(column, row) {
  return (column * STAGGER_STEP) + (row * STAGGER_STEP);
}

function applyStaggerDelay(element, column, row) {
  element.style.animationDelay = `${calculateStaggerDelay(column, row)}s`;
}

function createKeyElement(note, baseMidi, column, row, transposeOffset, showSolfege) {
  const key = document.createElement('div');
  key.className = `key${isBlackKey(note) ? ' black' : ''}`;
  key.dataset.note = baseMidi;
  const displayMidi = baseMidi + transposeOffset;
  key.textContent = showSolfege ? midiToSolfege(displayMidi) : midiToName(displayMidi);
  applyStaggerDelay(key, column, row);
  return key;
}

function getKeyUnderPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const key = el.closest('.key');
  if (!key || key.dataset.note === undefined) return null;
  return key;
}

function onPointerDown(e) {
  e.preventDefault();
  const key = getKeyUnderPoint(e.clientX, e.clientY);
  if (key) {
    const midi = parseInt(key.dataset.note, 10);
    activePointers.set(e.pointerId, midi);
    _onNoteOn(midi);
  } else {
    activePointers.set(e.pointerId, null);
  }
}

function onPointerMove(e) {
  if (!activePointers.has(e.pointerId)) return;
  e.preventDefault();

  const key = getKeyUnderPoint(e.clientX, e.clientY);
  const newMidi = key ? parseInt(key.dataset.note, 10) : null;
  const currentMidi = activePointers.get(e.pointerId);

  if (newMidi !== currentMidi) {
    if (currentMidi !== null) {
      _onNoteOff(currentMidi);
    }
    if (newMidi !== null) {
      _onNoteOn(newMidi);
    }
    activePointers.set(e.pointerId, newMidi);
  }
}

function onPointerUp(e) {
  if (!activePointers.has(e.pointerId)) return;
  e.preventDefault();
  const midi = activePointers.get(e.pointerId);
  if (midi !== null) {
    _onNoteOff(midi);
  }
  activePointers.delete(e.pointerId);
}

function onPointerCancel(e) {
  if (!activePointers.has(e.pointerId)) return;
  const midi = activePointers.get(e.pointerId);
  if (midi !== null) {
    _onNoteOff(midi);
  }
  activePointers.delete(e.pointerId);
}

function onContextMenu(e) {
  e.preventDefault();
}

let eventsSetUp = false;

function setupContainerEvents(el) {
  if (eventsSetUp) return;
  const stage = el.parentElement;
  stage.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerCancel);
  eventsSetUp = true;
}

function buildRowElement(rowData, rowIndex, transposeOffset, showSolfege) {
  const rowEl = document.createElement('div');
  rowEl.className = `keyboard-row ${rowData.row}`;

  rowData.notes.forEach((note, colIndex) => {
    const midi = parseNoteName(note);
    const key = createKeyElement(note, midi, colIndex, rowIndex, transposeOffset, showSolfege);
    rowEl.appendChild(key);
  });

  return rowEl;
}

export function build(containerEl, onNoteOn, onNoteOff, transposeOffset = 0, showSolfege = false) {
  keyboardEl = containerEl;
  _onNoteOn = onNoteOn;
  _onNoteOff = onNoteOff;

  for (const midi of activePointers.values()) {
    if (midi !== null) _onNoteOff(midi);
  }
  keyboardEl.innerHTML = '';
  activePointers.clear();
  setupContainerEvents(keyboardEl);

  LAYOUT.forEach((row, rowIndex) => {
    const rowEl = buildRowElement(row, rowIndex, transposeOffset, showSolfege);
    keyboardEl.appendChild(rowEl);
  });
}

function selectExactKey(midi) {
  if (!keyboardEl) return [];
  return keyboardEl.querySelectorAll(`[data-note="${midi}"]`);
}

export function updateNotation(showSolfege, transposeOffset) {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll('.key').forEach((key) => {
    const baseMidi = parseInt(key.dataset.note, 10);
    const displayMidi = baseMidi + transposeOffset;
    key.textContent = showSolfege ? midiToSolfege(displayMidi) : midiToName(displayMidi);
  });
}

export function highlightOn(midi) {
  selectExactKey(midi).forEach((key) => key.classList.add('active'));
}

export function highlightOff(midi) {
  selectExactKey(midi).forEach((key) => key.classList.remove('active'));
}

export function clearAllHighlights() {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll('.key.active').forEach((key) => key.classList.remove('active'));
}
