import { LAYOUT, parseNoteName, midiToName, isBlackKey } from './notes.js';

const STAGGER_STEP = 0.04;

let keyboardEl = null;

function calculateStaggerDelay(column, row) {
  return (column * STAGGER_STEP) + (row * STAGGER_STEP);
}

function applyStaggerDelay(element, column, row) {
  element.style.animationDelay = `${calculateStaggerDelay(column, row)}s`;
}

function createKeyElement(note, baseMidi, column, row, transposeOffset) {
  const key = document.createElement('div');
  key.className = `key${isBlackKey(note) ? ' black' : ''}`;
  key.dataset.note = baseMidi;
  key.textContent = midiToName(baseMidi + transposeOffset);
  applyStaggerDelay(key, column, row);
  return key;
}

function attachPointerEvents(key, midi, onNoteOn, onNoteOff) {
  key.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onNoteOn(midi);
  });
  key.addEventListener('pointerup', () => onNoteOff(midi));
  key.addEventListener('pointerleave', () => onNoteOff(midi));
}

function buildRowElement(rowData, rowIndex, onNoteOn, onNoteOff, transposeOffset) {
  const rowEl = document.createElement('div');
  rowEl.className = `keyboard-row ${rowData.row}`;

  rowData.notes.forEach((note, colIndex) => {
    const midi = parseNoteName(note);
    const key = createKeyElement(note, midi, colIndex, rowIndex, transposeOffset);
    attachPointerEvents(key, midi, onNoteOn, onNoteOff);
    rowEl.appendChild(key);
  });

  return rowEl;
}

export function build(containerEl, onNoteOn, onNoteOff, transposeOffset = 0) {
  keyboardEl = containerEl;
  keyboardEl.innerHTML = '';

  LAYOUT.forEach((row, rowIndex) => {
    const rowEl = buildRowElement(row, rowIndex, onNoteOn, onNoteOff, transposeOffset);
    keyboardEl.appendChild(rowEl);
  });
}

function selectExactKey(midi) {
  if (!keyboardEl) return [];
  return keyboardEl.querySelectorAll(`[data-note="${midi}"]`);
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