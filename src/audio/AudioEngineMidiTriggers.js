import { phraseMidiSelector } from '../selectors/selectorTransport.js'

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
      command.bar >= engine.playheadPositionBars
    })
  }

  // Keep track of last state to avoid duplicated updates
  engine.lastState.phrase = state.phrase

}


// TODO REFACTOR AS VIRTUAL AUDIO GRAPH STYLE
let oscillators = []
let amplitudeEnvelopes = []
let masterBus
let easing = 0.001
let keyFrequency = [] // Set the frequencies for the notes
for (let i = 1; i <= 88; i++)
  keyFrequency[i] = Math.pow(2, (i-49)/12) * 440

// ============================================================================
// MIDI TRIGGERS
// ============================================================================
// This triggers can be used to schedule sounds at:
// a) Specific timestamps relative to the AudioContext (i.e. engine.ctx)
// b) In real-time, if time is ommitted
export function killNote(engine, trackID, keyNum) {
  fireNote(engine, trackID, keyNum, 0, 0)
}
export function fireNote(engine, trackID, keyNum, velocity, time) {
  let trackModule = engine.trackModules[trackID]
  let instrument = trackModule.effectsChain[0]
  instrument.fireNote(keyNum, velocity, time)
}
