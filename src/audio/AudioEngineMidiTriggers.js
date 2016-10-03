import load from 'audio-loader'
import {
  phraseMidiSelector,
  phraseAudioSelector,
} from 'selectors/selectorTransport'
import { midiNoteOn, midiEvent } from 'reducers/reduceMIDI'

import {
  BEATS_PER_BAR,
  SECONDS_PER_MINUTE,
  playTimeToBar,
} from 'helpers/audioHelpers'

// ============================================================================
// CONVERT NOTES TO MIDI COMAMNDS
// ============================================================================
// This converts notes in the state into MIDI start and stop commands that
// can be used to fire and kill sounds using the above two methods
export function updateMidiCommands(engine, state) {

  // Playing, ensure latest notes are played next
  let latestMidiCommands = phraseMidiSelector(state)
  if (latestMidiCommands !== engine.midiCommands) {
    engine.midiCommands = latestMidiCommands
    engine.iCommand = engine.midiCommands.findIndex(command => {
      return command.start >= engine.playheadPositionBars
    })
  }

  // Update tempo in realtime
  if (state.phrase.present.tempo !== engine.lastState.phrase.present.tempo) {
    engine.playheadPositionBars = playTimeToBar(engine.ctx.currentTime, engine)
    engine.playStartTime = engine.ctx.currentTime - engine.playheadPositionBars * BEATS_PER_BAR * SECONDS_PER_MINUTE / state.phrase.present.tempo
  }

}

// ============================================================================
// CONVERT AUDIO CLIPS TO PLAYBACK COMAMNDS
// ============================================================================
// This converts audio clips into playback commands
export function updateAudioCommands(engine, STORE) {

  // Playing, ensure latest notes are played next
  let audioClips = phraseAudioSelector(STORE.getState())

  if (audioClips !== engine.audioCommands) {
    engine.audioClips = audioClips
    engine.iClip = engine.audioClips.findIndex(clip => {
      return clip.start >= engine.playheadPositionBars
    })
  }

}

export function loadSample(engine, url) {
  if (!engine.bufferMap[url]) {
    load(engine.ctx, url).then(result => {
      engine.bufferMap[url] = result
    })
  }
}

// TODO REFACTOR AS VIRTUAL AUDIO GRAPH STYLE
let keyFrequency = [] // Set the frequencies for the notes
for (let i = 1; i <= 88; i++)
  keyFrequency[i] = Math.pow(2, (i-49)/12) * 440

// ============================================================================
// MIDI TRIGGERS
// ============================================================================
// This triggers can be used to schedule sounds at:
// a) Specific timestamps relative to the AudioContext (i.e. engine.ctx)
// b) In real-time, if time is ommitted
export function killNote({ engine, trackID, keyNum, disableRecording = false }) {
  fireNote({ engine, trackID, keyNum, disableRecording })
}

export function fireNote({
  engine,
  trackID,
  keyNum,
  velocity = 0,
  time = 0,
  disableRecording = false,
}) {
  let trackModule = engine.trackModules[trackID]
  let instrument = trackModule.effectsChain[0]

  instrument.fireNote(keyNum, velocity, time)

  if (!disableRecording) {
    engine.STORE.dispatch(midiNoteOn({
      key: keyNum,
      velocity,
      start: velocity && (time || playTimeToBar(engine.ctx.currentTime, engine)),
      end: !velocity && (time || playTimeToBar(engine.ctx.currentTime, engine)),
    }))
  }
}

export function killAudio({
  engine,
  trackID,
}) {
  let trackModule = engine.trackModules[trackID]
  let audioIn = trackModule.effectsChain[0]

  audioIn.killAudio()
}
export function fireAudio({
  engine,
  clip,
}) {
  let buffer = engine.bufferMap[clip.audioUrl]
  let trackModule = engine.trackModules[clip.trackID]
  let audioIn = trackModule.effectsChain[0]
  let currentPosition = engine.playheadPositionBars - clip.start
  let duration = clip.end - engine.playheadPositionBars
  let id = `${clip.id}-${clip.url}`

  if (buffer && trackModule && audioIn && duration > 0) {
    audioIn.fireAudio({ id, buffer, currentPosition, duration })
  }
}

export function sendMidiEvent({
  engine,
  trackID,
  type,
  key,
  velocity,
  disableRecording = false,
}) {
  let trackModule = engine.trackModules[trackID]
  // send MIDI event through entire instrument rack
  trackModule.effectsChain.forEach(plugin => plugin.onMidiEvent({
    type, key, velocity,
  }))

  if (!disableRecording) {
    engine.STORE.dispatch(midiEvent({
      bar: playTimeToBar(engine.ctx.currentTime, engine),
      type,
      key,
      velocity,
    }))
  }
}
