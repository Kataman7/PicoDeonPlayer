export const SEMITONE = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Fs: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11
};

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
  acoustic_grand_piano: 'Acoustic Grand Piano',
  bright_acoustic_piano: 'Bright Acoustic Piano',
  electric_grand_piano: 'Electric Grand Piano',
  honkytonk_piano: 'Honky-tonk Piano',
  electric_piano_1: 'Electric Piano 1',
  electric_piano_2: 'Electric Piano 2',
  harpsichord: 'Harpsichord',
  clavinet: 'Clavinet',
  celesta: 'Celesta',
  glockenspiel: 'Glockenspiel',
  music_box: 'Music Box',
  vibraphone: 'Vibraphone',
  marimba: 'Marimba',
  xylophone: 'Xylophone',
  tubular_bells: 'Tubular Bells',
  dulcimer: 'Dulcimer',
  drawbar_organ: 'Drawbar Organ',
  percussive_organ: 'Percussive Organ',
  rock_organ: 'Rock Organ',
  church_organ: 'Church Organ',
  reed_organ: 'Reed Organ',
  accordion: 'Accordion',
  harmonica: 'Harmonica',
  tango_accordion: 'Tango Accordion',
  acoustic_guitar_nylon: 'Acoustic Guitar (nylon)',
  acoustic_guitar_steel: 'Acoustic Guitar (steel)',
  electric_guitar_jazz: 'Electric Guitar (jazz)',
  electric_guitar_clean: 'Electric Guitar (clean)',
  electric_guitar_muted: 'Electric Guitar (muted)',
  overdriven_guitar: 'Overdriven Guitar',
  distortion_guitar: 'Distortion Guitar',
  guitar_harmonics: 'Guitar harmonics',
  acoustic_bass: 'Acoustic Bass',
  electric_bass_finger: 'Electric Bass (finger)',
  electric_bass_pick: 'Electric Bass (pick)',
  fretless_bass: 'Fretless Bass',
  slap_bass_1: 'Slap Bass 1',
  slap_bass_2: 'Slap Bass 2',
  synth_bass_1: 'Synth Bass 1',
  synth_bass_2: 'Synth Bass 2',
  violin: 'Violin',
  viola: 'Viola',
  cello: 'Cello',
  contrabass: 'Contrabass',
  tremolo_strings: 'Tremolo Strings',
  pizzicato_strings: 'Pizzicato Strings',
  orchestral_harp: 'Orchestral Harp',
  timpani: 'Timpani',
  string_ensemble_1: 'String Ensemble 1',
  string_ensemble_2: 'String Ensemble 2',
  synth_strings_1: 'SynthStrings 1',
  synth_strings_2: 'SynthStrings 2',
  choir_aahs: 'Choir Aahs',
  voice_oohs: 'Voice Oohs',
  synth_choir: 'Synth Voice',
  orchestra_hit: 'Orchestra Hit',
  trumpet: 'Trumpet',
  trombone: 'Trombone',
  tuba: 'Tuba',
  muted_trumpet: 'Muted Trumpet',
  french_horn: 'French Horn',
  brass_section: 'Brass Section',
  synth_brass_1: 'SynthBrass 1',
  synth_brass_2: 'SynthBrass 2',
  soprano_sax: 'Soprano Sax',
  alto_sax: 'Alto Sax',
  tenor_sax: 'Tenor Sax',
  baritone_sax: 'Baritone Sax',
  oboe: 'Oboe',
  english_horn: 'English Horn',
  bassoon: 'Bassoon',
  clarinet: 'Clarinet',
  piccolo: 'Piccolo',
  flute: 'Flute',
  recorder: 'Recorder',
  pan_flute: 'Pan Flute',
  blown_bottle: 'Blown Bottle',
  shakuhachi: 'Shakuhachi',
  whistle: 'Whistle',
  ocarina: 'Ocarina',
  lead_1_square: 'Lead 1 (square)',
  lead_2_sawtooth: 'Lead 2 (sawtooth)',
  lead_3_calliope: 'Lead 3 (calliope)',
  lead_4_chiff: 'Lead 4 (chiff)',
  lead_5_charang: 'Lead 5 (charang)',
  lead_6_voice: 'Lead 6 (voice)',
  lead_7_fifths: 'Lead 7 (fifths)',
  lead_8_bass__lead: 'Lead 8 (bass + lead)',
  pad_1_new_age: 'Pad 1 (new age)',
  pad_2_warm: 'Pad 2 (warm)',
  pad_3_polysynth: 'Pad 3 (polysynth)',
  pad_4_choir: 'Pad 4 (choir)',
  pad_5_bowed: 'Pad 5 (bowed)',
  pad_6_metallic: 'Pad 6 (metallic)',
  pad_7_halo: 'Pad 7 (halo)',
  pad_8_sweep: 'Pad 8 (sweep)',
  fx_1_rain: 'FX 1 (rain)',
  fx_2_soundtrack: 'FX 2 (soundtrack)',
  fx_3_crystal: 'FX 3 (crystal)',
  fx_4_atmosphere: 'FX 4 (atmosphere)',
  fx_5_brightness: 'FX 5 (brightness)',
  fx_6_goblins: 'FX 6 (goblins)',
  fx_7_echoes: 'FX 7 (echoes)',
  fx_8_scifi: 'FX 8 (sci-fi)',
  sitar: 'Sitar',
  banjo: 'Banjo',
  shamisen: 'Shamisen',
  koto: 'Koto',
  kalimba: 'Kalimba',
  bagpipe: 'Bag pipe',
  fiddle: 'Fiddle',
  shanai: 'Shanai',
  tinkle_bell: 'Tinkle Bell',
  agogo: 'Agogo',
  steel_drums: 'Steel Drums',
  woodblock: 'Woodblock',
  taiko_drum: 'Taiko Drum',
  melodic_tom: 'Melodic Tom',
  synth_drum: 'Synth Drum',
  reverse_cymbal: 'Reverse Cymbal',
  guitar_fret_noise: 'Guitar Fret Noise',
  breath_noise: 'Breath Noise',
  seashore: 'Seashore',
  bird_tweet: 'Bird Tweet',
  telephone_ring: 'Telephone Ring',
  helicopter: 'Helicopter',
  applause: 'Applause',
  gunshot: 'Gunshot'
};

const NOTE_NAME_REGEX = /^([A-G][sb]?)(\d)?$/;

function extractSemitone(name) {
  return SEMITONE[name];
}

export function parseNoteName(name) {
  const match = name.match(NOTE_NAME_REGEX);
  if (!match) return null;

  const semitone = extractSemitone(match[1]);
  if (semitone === undefined) return null;

  const octaveOffset = match[2] ? parseInt(match[2], 10) : 0;
  const octave = BASE_OCTAVE + octaveOffset;
  return semitone + (octave + 1) * 12;
}

export function noteDisplayName(name) {
  const match = name.match(NOTE_NAME_REGEX);
  if (!match) return name;

  const display = DISPLAY[match[1]] || match[1];
  const octaveOffset = match[2];

  if (!octaveOffset) return display;
  return display + octaveOffset;
}

export function isBlackKey(name) {
  const match = name.match(/^([A-G][sb]?)/);
  if (!match) return false;
  return BLACK_KEYS.has(SEMITONE[match[1]]);
}

const SEMITONE_NAMES = Object.keys(SEMITONE);

export function midiToName(midi) {
  const semitoneVal = midi % 12;
  const octaveVal = Math.floor(midi / 12) - 1 - BASE_OCTAVE;
  const keyName = SEMITONE_NAMES.find((k) => SEMITONE[k] === semitoneVal);

  if (!keyName) return '???';

  const displayKey = DISPLAY[keyName] || keyName;
  return displayKey + (octaveVal === 0 ? '' : octaveVal);
}