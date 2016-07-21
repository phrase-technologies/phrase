import { fireNote } from 'audio/AudioEngineMidiTriggers.js'
import {
  phraseCreateNote,
  phraseCreateClip,
} from 'reducers/reducePhrase.js'

// ============================================================================
// MIDI CONTROLLERS
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
//
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default (engine, STORE) => {

  let midiAccess
  let synchronizationRegistry = {}
  let synchronizationCallback
  let recordingStack = []

  try {
    navigator.requestMIDIAccess().then(response => {
      midiAccess = response
      midiAccess.onstatechange = onstatechange
      for (let entry of midiAccess.inputs) {
        entry[1].onmidimessage = onMIDIMessage
      }
    })
  } catch (e) {
    console.error(e)
  }

  let onMIDIMessage = (event) => {
    let state = STORE.getState()
    let [ type, key, velocity ] = event.data

    /*
     *  TODO:
     *    - add note to track if recording
     *    - pitch bends / knobs / sliders etc
     *    - make mapping for event types, eg - 144: note on/off, 224: pitch bend
     */

    let armedTrack = state.phrase.present.tracks.find(x => x.id === state.phraseMeta.trackSelectionID)
    if (armedTrack && [144, 128].some(x => x === type)) {
      fireNote({ engine, trackID: armedTrack.id, keyNum: key, velocity, disableVisualPreview: false })

      // Recording
      if (state.transport.recording) {
        // Start a new note
        if (velocity) {
          recordingStack[key] = {
            velocity,
            start: engine.playheadPositionBars,
          }
          // Create the target clip if this is first note being recorded
          if (!Number.isInteger(state.transport.targetClipID)) {
            STORE.dispatch(phraseCreateClip({
              trackID: state.phraseMeta.trackSelectionID,
              start: state.transport.playhead,
              snapStart: true,
              ignore: true,
              newRecording: true,
              recordingTargetClipID: state.phrase.present.clipAutoIncrement,
            }))
          }
        }

        // End the note
        else {
          if (recordingStack[key]) {
            STORE.dispatch(phraseCreateNote({
              targetClipID: state.transport.targetClipID,
              key,
              start: recordingStack[key].start,
              end: engine.playheadPositionBars,
              velocity: recordingStack[key].velocity,
              ignore: true,
              snapStart: false,
            }))
          }
        }
      }
    }
  }

  function onstatechange({ port }) {
    if (port.connection === "closed" || !synchronizationRegistry[port.id]) {
      port.onmidimessage = onMIDIMessage
    }
    synchronize()
  }

  function synchronize() {
    if (synchronizationCallback && midiAccess) {
      let controllers = []
      midiAccess.inputs.forEach(entry => controllers.push(entry))
      synchronizationCallback(controllers)
    }
  }

  return {
    registerSynchronizationCallback: (callback) => {
      synchronizationCallback = callback
      synchronize()
    },
    destroySynchronizationCallback: () => {
      synchronizationCallback = undefined
    },
  }

}
