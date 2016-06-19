import {
  fireNote,
  killNote,
} from './AudioEngineMidiTriggers.js'
import { delay } from 'helpers/asyncHelpers.js'

// ============================================================================
// MIDI CONTROLLERS
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
//
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default (engine, STORE) => {

  let midiAccess

  let onMIDIMessage = (event) => {
    let state = STORE.getState()
    let [ type, key, velocity ] = event.data

    /*
     *  TODO:
     *    - add note to track if recording
     *    - pitch bends / knobs / sliders etc
     *    - make mapping for event types, eg - 144: note on/off, 224: pitch bend
     */

    let armedTrack = state.phrase.present.tracks.find(x => x.arm)
    if (armedTrack && [144, 128].some(x => x === type)) {
      if (velocity) fireNote(engine, armedTrack.id, key, velocity)
      else killNote(engine, armedTrack.id, key, velocity)
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
