import _ from 'lodash'

import { fireNote, sendMidiEvent } from 'audio/AudioEngineMidiTriggers.js'
import { layout } from 'actions/actions'

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
    if (!navigator.requestMIDIAccess)
      throw("navigator.requestMIDIAccess is not defined.")

    navigator.requestMIDIAccess().then(response => {
      midiAccess = response
      midiAccess.onstatechange = onstatechange
      for (let entry of midiAccess.inputs) {
        entry[1].onmidimessage = onMIDIMessage
      }

      // First time visitor? Show input methods tour, show correct page based on connections
      if (!localStorage.returningVisitor) {
        let targetTourPage = (midiAccess && midiAccess.inputs.size)
          ? 1 // External MIDI Controllers already detected? show MIDI Controller page
          : 0 // No controllers detected? Show generic input methods page.
        STORE.dispatch({ type: layout.SET_INPUT_METHODS_TOUR, openInputMethod: targetTourPage })
        localStorage.setItem("returningVisitor", true)
      }
    })
  } catch (e) {
    // Exception means no Web MIDI support
    STORE.dispatch(midiFlagUnavailable())
    console.error(e)

    // No MIDI support? Show generic input methods page to first time visitors
    if (!localStorage.returningVisitor) {
      STORE.dispatch({ type: layout.SET_INPUT_METHODS_TOUR, openInputMethod: 0 })
      localStorage.setItem("returningVisitor", true)
    }
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
