import _ from 'lodash'

import { fireNote, sendMidiEvent } from 'audio/AudioEngineMidiTriggers.js'
import {
  midiConnectionSync,
  midiFlagUnavailable,
} from 'reducers/reduceMIDI'

// ============================================================================
// MIDI CONTROLLERS
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
//
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default (engine, STORE) => {

  let midiAccess

  try {
    navigator.requestMIDIAccess().then(response => {
      midiAccess = response
      midiAccess.onstatechange = onstatechange
      for (let entry of midiAccess.inputs) {
        entry[1].onmidimessage = onMIDIMessage
      }
    })
  } catch (e) {
    STORE.dispatch(midiFlagUnavailable())
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

    // Note on / off events
    if (armedTrack && [144, 128].some(x => x === type)) {
      let yamahaOffsetCompensation = event.srcElement.manufacturer === "Yamaha" ? 12 : 0

      fireNote({
        engine,
        trackID: armedTrack.id,
        keyNum: key - yamahaOffsetCompensation,
        velocity,
      })
    }
    // Any other MIDI event
    else if (armedTrack) {
      sendMidiEvent({
        trackID: armedTrack.id,
        engine,
        type,
        key,
        velocity
      })
    }
  }

  function onstatechange({ port }) {
    if (port.connection === "closed") {
      port.onmidimessage = onMIDIMessage
    }
    let numPorts = 0
    let manufacturers = []
    midiAccess.inputs.forEach(entry => {
      numPorts++
      manufacturers = _.union(manufacturers, [entry.manufacturer])
    })
    STORE.dispatch(midiConnectionSync({ numPorts, manufacturers }))
  }

}
