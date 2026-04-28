let midiAccess = null;
let currentInput = null;
let onMessage = null;
let onDevicesChanged = null;

const MIDI_COMMAND_MASK = 0xf0;
const NOTE_ON_COMMAND = 0x90;
const NOTE_OFF_COMMAND = 0x80;
const NOTE_ON_VELOCITY_THRESHOLD = 0;

function isNoteOnCommand(command, velocity) {
  return command === NOTE_ON_COMMAND && velocity > NOTE_ON_VELOCITY_THRESHOLD;
}

function isNoteOffCommand(command, velocity) {
  return command === NOTE_OFF_COMMAND || (command === NOTE_ON_COMMAND && velocity === 0);
}

function parseMidiCommand(data) {
  return data[0] & MIDI_COMMAND_MASK;
}

function extractMidiEvent(event) {
  const command = parseMidiCommand(event.data);
  const note = event.data[1];
  const velocity = event.data[2];
  return { command, note, velocity };
}

function createInputOption(input) {
  const opt = document.createElement('option');
  opt.value = input.id;
  opt.textContent = input.name;
  return opt;
}

function isPicoDeonDevice(input) {
  return input.name.toLowerCase().includes('picodeon');
}

function buildDeviceOptions(inputs) {
  const fragment = document.createDocumentFragment();
  let hasDevice = false;

  inputs.forEach((input) => {
    hasDevice = true;
    fragment.appendChild(createInputOption(input));
  });

  return { hasDevice, fragment };
}

function findAutoConnectTarget(inputs) {
  let targetId = null;
  inputs.forEach((input) => {
    if (isPicoDeonDevice(input)) targetId = input.id;
  });
  return targetId;
}

function restoreOrAutoConnect(select, prevValue, targetId, hasDevice) {
  if (prevValue && hasDevice) {
    select.value = prevValue;
  } else if (targetId) {
    select.value = targetId;
    connectInput(targetId);
  }
}

export function init(onNoSupport, onDenied) {
  if (!navigator.requestMIDIAccess) {
    onNoSupport();
    return;
  }

  navigator.requestMIDIAccess({ sysex: false })
    .then((access) => {
      midiAccess = access;
      midiAccess.onstatechange = () => {
        const has = populateInputSelect();
        if (onDevicesChanged) onDevicesChanged(has);
      };
      const has = populateInputSelect();
      if (onDevicesChanged) onDevicesChanged(has);
    })
    .catch((err) => onDenied(err));
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

  const { hasDevice, fragment } = buildDeviceOptions(midiAccess.inputs);
  sel.appendChild(fragment);

  const targetId = findAutoConnectTarget(midiAccess.inputs);
  restoreOrAutoConnect(sel, prev, targetId, hasDevice);

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

  const { command, note, velocity } = extractMidiEvent(event);

  if (isNoteOnCommand(command, velocity)) onMessage(note, true);
  else if (isNoteOffCommand(command, velocity)) onMessage(note, false);
}