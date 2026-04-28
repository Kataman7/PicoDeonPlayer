import { LAYOUT, parseNoteName, noteDisplayName, isBlackKey } from './notes.js';

const STAGGER_STEP = 0.04;

let keyboardEl = null;

function calculateStaggerDelay(column, row) {
  return (column * STAGGER_STEP) + (row * STAGGER_STEP);
}

function applyStaggerDelay(element, column, row) {
  element.style.animationDelay = `${calculateStaggerDelay(column, row)}s`;
}

function createKeyElement(note, midi, column, row) {
  const key = document.createElement('div');
  key.className = `key${isBlackKey(note) ? ' black' : ''}`;
  key.dataset.note = midi;
  key.textContent = noteDisplayName(note);
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

function buildRowElement(rowData, rowIndex, onNoteOn, onNoteOff) {
  const rowEl = document.createElement('div');
  rowEl.className = `keyboard-row ${rowData.row}`;

  rowData.notes.forEach((note, colIndex) => {
    const midi = parseNoteName(note);
    const key = createKeyElement(note, midi, colIndex, rowIndex);
    attachPointerEvents(key, midi, onNoteOn, onNoteOff);
    rowEl.appendChild(key);
  });

  return rowEl;
}

export function build(containerEl, onNoteOn, onNoteOff) {
  keyboardEl = containerEl;
  keyboardEl.innerHTML = '';

  LAYOUT.forEach((row, rowIndex) => {
    const rowEl = buildRowElement(row, rowIndex, onNoteOn, onNoteOff);
    keyboardEl.appendChild(rowEl);
  });
}

function readMidiFromKey(key) {
  return parseInt(key.dataset.note, 10);
}

function forEachMatchingKey(pitchClass, callback) {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll('.key').forEach((key) => {
    if (readMidiFromKey(key) % 12 === pitchClass) {
      callback(key);
    }
  });
}

export function highlightOn(midi) {
  const pitchClass = midi % 12;
  forEachMatchingKey(pitchClass, (key) => key.classList.add('active'));
}

export function highlightOff(midi) {
  const pitchClass = midi % 12;
  forEachMatchingKey(pitchClass, (key) => key.classList.remove('active'));
}

export function clearAllHighlights() {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll('.key.active').forEach((key) => key.classList.remove('active'));
}