import { LAYOUT, parseNoteName, noteDisplayName, isBlackKey } from './notes.js';

let keyboardEl = null;

export function build(containerEl, onNoteOn, onNoteOff) {
  keyboardEl = containerEl;
  keyboardEl.innerHTML = '';
  LAYOUT.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = `keyboard-row ${row.row}`;
    row.notes.forEach(name => {
      const midi = parseNoteName(name);
      const key = document.createElement('div');
      key.className = `key${isBlackKey(name) ? ' black' : ''}`;
      key.dataset.note = midi;
      key.textContent = noteDisplayName(name);
      key.addEventListener('pointerdown', e => { e.preventDefault(); onNoteOn(midi); });
      key.addEventListener('pointerup', () => onNoteOff(midi));
      key.addEventListener('pointerleave', () => onNoteOff(midi));
      rowEl.appendChild(key);
    });
    keyboardEl.appendChild(rowEl);
  });
}

export function highlightOn(midi) {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll(`[data-note="${midi}"]`).forEach(k => k.classList.add('active'));
}

export function highlightOff(midi) {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll(`[data-note="${midi}"]`).forEach(k => k.classList.remove('active'));
}

export function clearAllHighlights() {
  if (!keyboardEl) return;
  keyboardEl.querySelectorAll('.key.active').forEach(k => k.classList.remove('active'));
}