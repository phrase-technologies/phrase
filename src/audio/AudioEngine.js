import { updateNodes,
         getTrackOutputDecibels } from './AudioEngineNodes.js'
import { fireNote,
         killNote,
         updateMidiCommands } from './AudioEngineMidiTriggers.js'
import { startPlayback,
         stopPlayback } from './AudioEnginePlaybackLoop.js'

var AudioContext = AudioContext || webkitAudioContext

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
  var engine = {
    ctx: new AudioContext(),
    masterGain: null,
    trackModules: {},
    midiCommands: [],
    iCommand: null,
    isPlaying: false,
    playStartTime: null,
    playheadPositionBars: null,
    stopQueued: false,
    unsubscribeStoreChanges: null,
    lastState: {
      tracks: null
    }
  }
  engine.masterGain = engine.ctx.createGain()
  engine.masterGain.connect( engine.ctx.destination )
  engine.masterGain.gain.value = 0.25

  // --------------------------------------------------------------------------
  // State-driven behaviours
  // --------------------------------------------------------------------------
  engine.unsubscribeStoreChanges = STORE.subscribe(() => {
    var state = STORE.getState()

    // PLAY Playback state
    if (state.transport.playing && !engine.isPlaying)
      startPlayback(engine, state, STORE.dispatch)

    // STOP Playback state
    if (!state.transport.playing && engine.isPlaying)
      stopPlayback(engine, state)

    // Tracks and Effects Chains
    if (state.phrase.present.tracks !== engine.lastState.tracks)
      updateNodes(engine, state)

    // Notes
    if (state.phrase !== engine.lastState.phrase)
      updateMidiCommands(engine, state)

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

