export const SEMITONE = { C:0, Db:1, D:2, Eb:3, E:4, F:5, Fs:6, G:7, Ab:8, A:9, Bb:10, B:11 };

export const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

export const BASE_OCTAVE = 3;

export const DISPLAY = {
  C: 'C', Db: 'D\u266D', D: 'D', Eb: 'E\u266D', E: 'E',
  F: 'F', Fs: 'F\u266F', G: 'G', Ab: 'A\u266D', A: 'A',
  Bb: 'B\u266D', B: 'B'
};

export const LAYOUT = [
  { row: 'r1', notes: ['G','Bb','Db1','E1','G1','Bb1','Db2','E2','G2','Bb2','Db3'] },
  { row: 'r2', notes: ['Fs','A','C1','Eb1','Fs1','A1','C2','Eb2','Fs2','A2','C3','Eb3'] },
  { row: 'r3', notes: ['Ab','B','D1','F1','Ab1','B1','D2','F2','Ab2','B2','D3'] },
  { row: 'r4', notes: ['G','Bb','Db1','E1','G1','Bb1','Db2','E2','G2','Bb2','Db3','E3'] },
  { row: 'r5', notes: ['A','C1','Eb1','Fs1','A1','C2','Eb2','Fs2','A2','C3','Eb3'] }
];

export const INSTRUMENTS = {
  accordion: 'Accordion',
  tango_accordion: 'Tango Accordion',
  reed_organ: 'Reed Organ',
  drawbar_organ: 'Drawbar Organ',
  percussive_organ: 'Percussive Organ',
  rock_organ: 'Rock Organ',
  church_organ: 'Church Organ',
  harmonica: 'Harmonica',
  acoustic_grand_piano: 'Grand Piano',
  bright_acoustic_piano: 'Bright Piano',
  honkytonk_piano: 'Honky-Tonk Piano',
  electric_piano_1: 'Electric Piano 1',
  electric_piano_2: 'Electric Piano 2',
  clavinet: 'Clavinet',
  vibraphone: 'Vibraphone',
  marimba: 'Marimba',
  xylophone: 'Xylophone',
  celesta: 'Celesta',
  glockenspiel: 'Glockenspiel',
  acoustic_guitar_nylon: 'Nylon Guitar',
  acoustic_guitar_steel: 'Steel Guitar',
  electric_guitar_clean: 'Clean Electric Guitar',
  electric_bass_finger: 'Finger Bass',
  string_ensemble_1: 'Strings',
  choir_aahs: 'Choir',
  synth_choir: 'Synth Choir',
  synth_brass_1: 'Synth Brass',
  synth_pad_1: 'Synth Pad',
  synth_pad_2: 'Synth Pad 2',
  flute: 'Flute',
  piccolo: 'Piccolo',
  oboe: 'Oboe',
  english_horn: 'English Horn',
  bassoon: 'Bassoon',
  clarinet: 'Clarinet',
  soprano_sax: 'Soprano Sax',
  alto_sax: 'Alto Sax',
  tenor_sax: 'Tenor Sax',
  baritone_sax: 'Baritone Sax',
  trumpet: 'Trumpet',
  trombone: 'Trombone',
  french_horn: 'French Horn',
  tuba: 'Tuba',
  music_box: 'Music Box'
};

export function parseNoteName(name) {
  const m = name.match(/^([A-G][sb]?)(\d)?$/);
  if (!m) return null;
  const semitone = SEMITONE[m[1]];
  if (semitone === undefined) return null;
  const octave = BASE_OCTAVE + (m[2] ? parseInt(m[2], 10) : 0);
  return semitone + (octave + 1) * 12;
}

export function noteDisplayName(name) {
  const m = name.match(/^([A-G][sb]?)/);
  if (!m) return name;
  return DISPLAY[m[1]] || m[1];
}

export function isBlackKey(name) {
  const m = name.match(/^([A-G][sb]?)/);
  if (!m) return false;
  return BLACK_KEYS.has(SEMITONE[m[1]]);
}