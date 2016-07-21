import u from 'updeep'
import { midi } from 'actions/actions'

// ============================================================================
// MIDI Action Creators
// ============================================================================
export const midiNoteOn = ({ key, velocity = 0 }) => ({ type: midi.NOTE_ON, payload: { key, velocity } })
export const midiNoteOff = ({ key }) => ({ type: midi.NOTE_OFF, payload: { key } })

// ============================================================================
// MIDI Reducer
// ============================================================================
export const defaultState = Array(128).fill(false)

export default function reduceMIDI(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case midi.NOTE_ON:
      return u({
        [action.payload.key]: action.payload.velocity,
      }, state)

    // ------------------------------------------------------------------------
    case midi.NOTE_OFF:
      return u({
        [action.payload.key]: false,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
