import { fireNote, sendMidiEvent } from './AudioEngineMidiTriggers.js'

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
    if (armedTrack) {
      sendMidiEvent({ engine, trackID: armedTrack.id, event })
    }
    if (armedTrack && [144, 128].some(x => x === type)) {
      let yamahaOffsetCompensation = event.srcElement.manufacturer === "Yamaha" ? 12 : 0

      fireNote({
        engine,
        trackID: armedTrack.id,
        keyNum: key - yamahaOffsetCompensation,
        velocity,
      })
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
