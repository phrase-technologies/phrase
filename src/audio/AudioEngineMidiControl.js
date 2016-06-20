import { fireNote } from './AudioEngineMidiTriggers.js'
import { delay } from 'helpers/asyncHelpers.js'
import { phraseCreateNote } from 'reducers/reducePhrase.js'

// ============================================================================
// MIDI CONTROLLERS
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
//
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default (engine, STORE) => {

  let midiAccess
  let recordingStack = []

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
      fireNote(engine, armedTrack.id, key, velocity)

      // Recording
      if (state.transport.recording) {
        // Start a new note
        if (velocity) {
          recordingStack[key] = {
            velocity,
            start: engine.playheadPositionBars,
          }
        // End
        } else {
          if (recordingStack[key]) {
            let {
              start,
              velocity,
            } = recordingStack[key]
            STORE.dispatch(phraseCreateNote({
              trackID: state.phraseMeta.trackSelectionID,
              key,
              start,
              end: engine.playheadPositionBars,
              velocity,
              ignore: true,
              snapStart: false,
            }))
          }
        }
      }
    }
  }

  return {
    getControllers: async () => {
      let [response] = await Promise.all([
        navigator.requestMIDIAccess(),
        delay(250)
      ])

      let controllers = []
      midiAccess = response
      for (let entry of midiAccess.inputs) {
        entry[1].onmidimessage = onMIDIMessage
        controllers.push(entry[1])
      }

      return controllers
    }
  }

}
