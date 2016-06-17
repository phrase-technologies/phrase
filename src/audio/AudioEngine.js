import { updateNodes,
         getTrackOutputDecibels } from './AudioEngineNodes.js'
import { fireNote,
         killNote,
         updateMidiCommands } from './AudioEngineMidiTriggers.js'
import { startPlayback,
         stopPlayback } from './AudioEnginePlaybackLoop.js'

let AudioContext = AudioContext || webkitAudioContext

// ============================================================================
// ENGINE CREATION
// ============================================================================
// This is the universal glue of the application. In this engine, each track
// is given a `trackModule` with a `gain`, a `pan`, `mute`/`solo` functionality,
// an `effectsChain`, and is routed into a `masterGain`.
export default function createAudioEngine(STORE) {

  // --------------------------------------------------------------------------
  // Initialize Internals
  // --------------------------------------------------------------------------
  // This is a private mutable object. It is passed around to other functions
  // inside this AudioEngine, which mutate it as a way to communicate
  // changes in real-time to other functions that also access it.
  //
  // Despite the strict use of immutables and pure functional strategies in
  // the Redux store and elsewhere in this app, we stick to mutable techniques
  // here as it is easy to grok. Perhaps worth investigating further in the
  // future if immutable techniques are helpful. TODO
  let engine = {
    ctx: new AudioContext(),
    masterGain: null,
    trackModules: {},
    midiCommands: [],
    midiAccess: false,
    iCommand: null,
    isPlaying: false,
    playStartTime: null,
    playheadPositionBars: null,
    stopQueued: false,
    unsubscribeStoreChanges: null,
    lastState: {
      tracks: null,
      phrase: STORE.getState().phrase,
    }
  }
  engine.masterGain = engine.ctx.createGain()
  engine.masterGain.connect(engine.ctx.destination)
  engine.masterGain.gain.value = 0.25

  // MIDI Connection
  function onMIDIMessage (event) {
    let state = STORE.getState()
    let [ type, key, velocity ] = event.data

    /*
     *  TODO:
     *    - add note to track if recording
     *    - pitch bends / knobs / sliders etc
     *    - make mapping for event types, eg - 144: note on/off, 224: pitch bend
     */

    let armedTrack = state.phrase.present.tracks.find(x => x.arm)
    if (armedTrack && type === 144) {
      if (velocity) fireNote(engine, armedTrack.id, key, velocity)
      else killNote(engine, armedTrack.id, key, velocity)
    }
  }

  try {
    navigator.requestMIDIAccess().then(
      midiAccess => {
        engine.midiAccess = midiAccess
        engine.midiAccess.inputs.forEach(entry => {
          entry.onmidimessage = onMIDIMessage
        })
      },
      error => console.log(`Failed to get MIDI access - ${error}`)
    )
  } catch (error) {
    console.error(`Failed to get MIDI access - ${error}`)
  }

  // --------------------------------------------------------------------------
  // State-driven behaviours
  // --------------------------------------------------------------------------
  engine.unsubscribeStoreChanges = STORE.subscribe(() => {
    let state = STORE.getState()

    // PLAY Playback state
    if (state.transport.playing && !engine.isPlaying)
      startPlayback(engine, state, STORE.dispatch)

    // STOP Playback state
    if (!state.transport.playing && engine.isPlaying)
      stopPlayback(engine, state)

    // Tracks and Effects Chains
    if (state.phrase.present.tracks !== engine.lastState.tracks)
      updateNodes(engine, state)

    // Notes + Tempo
    if (state.phrase !== engine.lastState.phrase)
      updateMidiCommands(engine, state)

    // Keep track of last state to avoid duplicated updates
    engine.lastState = state
  })

  // --------------------------------------------------------------------------
  // Expose the API
  // --------------------------------------------------------------------------
  return {
    fireNote: (trackID, keyNum, velocity) => {
      fireNote(engine, trackID, keyNum, velocity)
    },
    killNote: (trackID, keyNum) => {
      killNote(engine, trackID, keyNum)
    },
    getTrackOutputDecibels: (trackID) => {
      return getTrackOutputDecibels(engine, trackID)
    },
    destroy: () => {
      engine.unsubscribeStoreChanges()
      engine.ctx.close()
    }
  }
}
