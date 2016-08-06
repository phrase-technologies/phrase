import u from 'updeep'
import { midi } from 'actions/actions'

import {
  phraseCreateNote,
  phraseCreateClip,
  phraseCreateMidiEvent,
} from 'reducers/reducePhrase.js'

// ============================================================================
// MIDI Action Creators
// ============================================================================
export const midiNoteOff = ({ key, end }) => {
  return midiNoteOn({ key, end })
}

export const midiNoteOn = ({ key, start, end, velocity = 0 }) => {
  return (dispatch, getState) => {
    let state = getState()

    // Record the activity if recording
    if (state.transport.recording) {

      // Completed note - record it!
      if (!velocity) {
        dispatch(phraseCreateNote({
          targetClipID: state.transport.targetClipID,
          key,
          start: state.midi[key].start,
          end,
          velocity: state.midi[key].velocity,
          ignore: true,
          snapStart: false,
        }))
      }

      // Create the target clip if this is first note being recorded
      if (velocity && !Number.isInteger(state.transport.targetClipID)) {
        dispatch(phraseCreateClip({
          trackID: state.phraseMeta.trackSelectionID,
          start: state.transport.playhead,
          snapStart: true,
          ignore: true,
          newRecording: true,
          recordingTargetClipID: state.phrase.present.clipAutoIncrement,
        }))
      }
    }

    velocity
      ? dispatch({ type: midi.NOTE_ON, payload: { key, start, velocity } })
      : dispatch({ type: midi.NOTE_OFF, payload: { key } })
  }
}

export const midiEvent = ({ bar, type, key, velocity }) => {
  return (dispatch, getState) => {
    let state = getState()

    // Record the activity if recording
    if (state.transport.recording) {
      dispatch(phraseCreateMidiEvent({
        trackID: state.phraseMeta.trackSelectionID,
        clipID: state.transport.targetClipID,
        ignore: true,
        bar, type, key, velocity,
      }))
    }
  }
}

// ============================================================================
// MIDI Reducer
// ============================================================================
export const defaultState = Array(128).fill(null)

export default function reduceMIDI(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case midi.NOTE_ON:
      // Do not re-trigger keys that are already active
      if (state[action.payload.key])
        return state

      return u({
        [action.payload.key]: {
          velocity: action.payload.velocity,
          start: action.payload.start,
        }
      }, state)

    // ------------------------------------------------------------------------
    case midi.NOTE_OFF:
      return u({
        [action.payload.key]: null,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
