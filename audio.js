import { INSTRUMENTS } from './notes.js';

const DEFAULT_FADE_OUT = 0.2;
const FADE_OUT_MIN = 0;

const AUTO_RELEASE_EARLY_START = 0.1;
const AUTO_RELEASE_BUFFER_THRESHOLD = 0.3;

const LOOP_ATTACK_RATIO = 0.15;
const LOOP_SUSTAIN_END_RATIO = 0.9;
const LOOP_MIN_DURATION_SECONDS = 0.1;
const CROSSFADE_DURATION = 0.05;
const ZERO_CROSSING_SEARCH_RATIO = 0.1;

const THROWAWAY_STOP_DELAY = 0.001;
const MS_PER_SECOND = 1000;
const NEAR_ZERO_GAIN = 0.001;

let audioCtx = null;
let instrument = null;
let currentInstrName = null;
let isLoading = false;
let loadSeq = 0;
let onStatus = null;
let loopMode = false;
let fadeOutDuration = DEFAULT_FADE_OUT;

const preparedBuffers = new WeakMap();
const playingNodes = new Map();

function clampFadeOut(seconds) {
  return Math.max(FADE_OUT_MIN, seconds);
}

function createAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  return new Ctx();
}

function resumeContext(ctx) {
  if (ctx.state === 'suspended') ctx.resume();
}

function ensureAudioContext() {
  if (!audioCtx) audioCtx = createAudioContext();
  resumeContext(audioCtx);
}

export function init(statusCallback) {
  onStatus = statusCallback;
}

export function setFadeOutTime(seconds) {
  fadeOutDuration = clampFadeOut(seconds);
}

export function setLoopMode(enabled) {
  loopMode = enabled;
}

function searchRadiusFor(dataLength) {
  return Math.min(Math.floor(dataLength * ZERO_CROSSING_SEARCH_RATIO), dataLength - 1);
}

function findZeroCrossing(data, targetSample) {
  const radius = searchRadiusFor(data.length);
  const start = Math.max(1, targetSample - radius);
  const end = Math.min(data.length - 2, targetSample + radius);
  let bestPos = targetSample;
  let bestVal = Infinity;

  for (let i = start; i < end; i++) {
    if (data[i] * data[i + 1] <= 0) {
      const diff = Math.abs(data[i]) + Math.abs(data[i + 1]);
      if (diff < bestVal) {
        bestVal = diff;
        bestPos = i;
      }
    }
  }

  return bestPos;
}

function computeLoopBoundaries(buffer) {
  const frames = buffer.length;
  const attackEnd = Math.floor(frames * LOOP_ATTACK_RATIO);
  const sustainEnd = Math.floor(frames * LOOP_SUSTAIN_END_RATIO);
  const firstChannel = buffer.getChannelData(0);

  return {
    start: findZeroCrossing(firstChannel, attackEnd),
    end: findZeroCrossing(firstChannel, sustainEnd)
  };
}

function isViableLoop(loopLength, sampleRate) {
  return loopLength >= sampleRate * LOOP_MIN_DURATION_SECONDS;
}

function crossfadeChannel(dstData, srcData, loopStart, loopEnd, crossfadeFrames) {
  for (let i = 0; i < crossfadeFrames; i++) {
    const t = i / crossfadeFrames;
    const endOffset = loopEnd + i;
    const startOffset = loopStart + i;
    if (endOffset < srcData.length && startOffset < srcData.length) {
      dstData[endOffset] = srcData[endOffset] * (1 - t) + srcData[startOffset] * t;
    }
  }
}

function createCrossfadedBuffer(ctx, original, boundaries) {
  const sr = original.sampleRate;
  const channels = original.numberOfChannels;
  const loopLength = boundaries.end - boundaries.start;
  const crossfadeFrames = Math.min(Math.floor(CROSSFADE_DURATION * sr), Math.floor(loopLength / 2));
  const totalFrames = original.length + crossfadeFrames;
  const newBuffer = ctx.createBuffer(channels, totalFrames, sr);

  for (let ch = 0; ch < channels; ch++) {
    const srcData = original.getChannelData(ch);
    const dstData = newBuffer.getChannelData(ch);
    dstData.set(srcData, 0);
    crossfadeChannel(dstData, srcData, boundaries.start, boundaries.end, crossfadeFrames);
  }

  return {
    buffer: newBuffer,
    loopStart: boundaries.start / sr,
    loopEnd: (boundaries.end + crossfadeFrames) / sr
  };
}

function createPassThrough(original) {
  return {
    buffer: original,
    loopStart: 0,
    loopEnd: original.duration
  };
}

function buildLoopedBuffer(original) {
  if (preparedBuffers.has(original)) return preparedBuffers.get(original);

  const boundaries = computeLoopBoundaries(original);
  const loopLength = boundaries.end - boundaries.start;

  if (!isViableLoop(loopLength, original.sampleRate)) {
    const passThrough = createPassThrough(original);
    preparedBuffers.set(original, passThrough);
    return passThrough;
  }

  const result = createCrossfadedBuffer(audioCtx, original, boundaries);
  preparedBuffers.set(original, result);
  return result;
}

function shouldAbortLoad(expectedSeq) {
  return loadSeq !== expectedSeq;
}

function handleInstrumentLoaded(seq, inst, name) {
  if (shouldAbortLoad(seq)) return;
  instrument = inst;
  isLoading = false;
  onStatus(`${INSTRUMENTS[name]} ready`);
}

function handleInstrumentFailed(seq, name) {
  if (shouldAbortLoad(seq)) return;
  isLoading = false;
  onStatus(`Failed to load ${INSTRUMENTS[name]}`, true);
}

export function loadInstrument(name) {
  if (name === currentInstrName && (instrument || isLoading)) return;
  currentInstrName = name;
  instrument = null;
  isLoading = true;
  const thisSeq = ++loadSeq;
  ensureAudioContext();
  onStatus(`Loading ${INSTRUMENTS[name]}\u2026`);

  Soundfont.instrument(audioCtx, name, { soundfont: 'FluidR3_GM' })
    .then(inst => handleInstrumentLoaded(thisSeq, inst, name))
    .catch(() => handleInstrumentFailed(thisSeq, name));
}

function stopNodeSafely(source) {
  try { source.stop(); } catch (e) { }
}

function cancelPendingRelease(entry) {
  if (entry.autoReleaseId) clearTimeout(entry.autoReleaseId);
}

function createPlaybackGain() {
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.connect(audioCtx.destination);
  return gain;
}

function extractBufferFromNode(node) {
  return node.source && node.source.buffer ? node.source.buffer : null;
}

function createLoopSource(prepared, gain) {
  const source = audioCtx.createBufferSource();
  source.buffer = prepared.buffer;
  source.loop = true;
  source.loopStart = prepared.loopStart;
  source.loopEnd = prepared.loopEnd;
  source.connect(gain);
  return source;
}

function startLoopedPlayback(midi, prepared, gain) {
  const loopSource = createLoopSource(prepared, gain);
  loopSource.start(audioCtx.currentTime);
  playingNodes.set(midi, { loopSource, gain, autoReleaseId: null });
}

function stealBufferFromSoundfontNode(midi) {
  const gain = createPlaybackGain();
  const node = instrument.play(midi, audioCtx.currentTime, {
    destination: gain,
    loop: false,
    release: fadeOutDuration
  });

  const buffer = extractBufferFromNode(node);
  if (!buffer) {
    node.source.stop(audioCtx.currentTime + THROWAWAY_STOP_DELAY);
    return { buffer: null, gain };
  }

  node.source.stop(audioCtx.currentTime + THROWAWAY_STOP_DELAY);
  return { buffer, gain };
}

function playLooped(midi) {
  const stolen = stealBufferFromSoundfontNode(midi);
  if (!stolen.buffer) return;

  const prepared = buildLoopedBuffer(stolen.buffer);
  startLoopedPlayback(midi, prepared, stolen.gain);
}

function computeBufferDuration(source) {
  if (!source || !source.buffer) return 0;
  return source.buffer.duration / (source.playbackRate.value || 1);
}

function computeAutoReleaseDelay(duration) {
  if (duration <= fadeOutDuration + AUTO_RELEASE_BUFFER_THRESHOLD) return null;
  return (duration - fadeOutDuration - AUTO_RELEASE_EARLY_START) * MS_PER_SECOND;
}

function scheduleAutoStop(midi, node, delayMs) {
  return setTimeout(() => {
    if (playingNodes.has(midi)) stopNodeSafely(node);
  }, delayMs);
}

function playOneShot(midi) {
  const node = instrument.play(midi, audioCtx.currentTime, { release: fadeOutDuration });
  const duration = computeBufferDuration(node.source);
  const delay = computeAutoReleaseDelay(duration);
  const autoReleaseId = delay ? scheduleAutoStop(midi, node, delay) : null;

  playingNodes.set(midi, { source: node, autoReleaseId });
}

export function play(midi) {
  ensureAudioContext();
  if (!instrument && !isLoading) loadInstrument(currentInstrName);
  if (!instrument) return;

  if (playingNodes.has(midi)) stop(midi);
  if (loopMode) playLooped(midi);
  else playOneShot(midi);
}

function fadeOutNode(gain, source, duration) {
  const now = audioCtx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);

  if (duration > 0) {
    gain.gain.exponentialRampToValueAtTime(NEAR_ZERO_GAIN, now + duration);
    source.stop(now + duration);
  } else {
    source.stop(now);
  }
}

function stopLoopedEntry(entry) {
  fadeOutNode(entry.gain, entry.loopSource, fadeOutDuration);
}

function stopOneShotEntry(entry) {
  stopNodeSafely(entry.source);
}

export function stop(midi) {
  if (!playingNodes.has(midi)) return;
  const entry = playingNodes.get(midi);

  cancelPendingRelease(entry);
  if (entry.loopSource) stopLoopedEntry(entry);
  else stopOneShotEntry(entry);

  playingNodes.delete(midi);
}

export function currentName() {
  return currentInstrName;
}