let midiAccess = null;
let currentInput = null;
let onMessage = null;
let onDevicesChanged = null;

export function init(onNoSupport, onDenied) {
  if (!navigator.requestMIDIAccess) {
    onNoSupport();
    return;
  }
  return navigator.requestMIDIAccess({ sysex: false })
    .then(access => {
      midiAccess = access;
      midiAccess.onstatechange = () => {
        const has = populateInputSelect();
        if (onDevicesChanged) onDevicesChanged(has);
      };
      const has = populateInputSelect();
      if (onDevicesChanged) onDevicesChanged(has);
    })
    .catch(err => onDenied(err));
}

export function setOnMessage(cb) {
  onMessage = cb;
}

export function setOnDevicesChanged(cb) {
  onDevicesChanged = cb;
}

export function populateInputSelect() {
  const sel = document.getElementById('midiInput');
  const prev = sel.value;
  sel.innerHTML = '<option value="">\u2014 MIDI Input \u2014</option>';
  if (!midiAccess) return false;

  let hasDevice = false;
  midiAccess.inputs.forEach(input => {
    hasDevice = true;
    const opt = document.createElement('option');
    opt.value = input.id;
    opt.textContent = input.name;
    sel.appendChild(opt);
  });

  if (prev && hasDevice) {
    sel.value = prev;
  }
  return hasDevice;
}

export function connectInput(id) {
  if (currentInput) currentInput.onmidimessage = null;
  currentInput = null;
  if (!id || !midiAccess) return null;
  currentInput = midiAccess.inputs.get(id);
  if (currentInput) {
    currentInput.onmidimessage = handleMidiEvent;
    return currentInput.name;
  }
  return null;
}

function handleMidiEvent(event) {
  if (!onMessage) return;
  const command = event.data[0] & 0xf0;
  const note = event.data[1];
  const velocity = event.data[2];
  const isNoteOn = command === 0x90 && velocity > 0;
  const isNoteOff = command === 0x80 || (command === 0x90 && velocity === 0);
  if (isNoteOn) onMessage(note, true);
  else if (isNoteOff) onMessage(note, false);
}