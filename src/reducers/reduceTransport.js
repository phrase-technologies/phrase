import u from 'updeep'
import { phrase, transport } from '../actions/actions.js'
import { phraseCreateClip } from 'reducers/reducePhrase'
import { ActionCreators as UndoActions } from 'redux-undo'

// ============================================================================
// Transport Action Creators
// ============================================================================
export const transportPlayToggle = () => {
  return (dispatch) => {
    dispatch(transportConsolidateRecording())
    dispatch({ type: transport.PLAY_TOGGLE })
  }
}
export const transportRewindPlayhead = (bar) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    if (state.transport.playing) {
      if (state.transport.recording)
        dispatch(transportRecord())
      dispatch({ type: transport.STOP })
      dispatch({ type: transport.REWIND_PLAYHEAD, bar, barCount })
      dispatch({ type: transport.PLAY_TOGGLE })
    } else {
      dispatch({ type: transport.REWIND_PLAYHEAD, bar, barCount })
    }
  }
}
export const transportMovePlayhead = (bar) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: transport.MOVE_PLAYHEAD, bar, barCount })
  }
}
export const transportAdvancePlayhead = (bar) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    if (state.transport.playing) {
      if (state.transport.recording)
        dispatch(transportRecord())
      dispatch({ type: transport.STOP })
      dispatch({ type: transport.ADVANCE_PLAYHEAD, bar, barCount })
      dispatch({ type: transport.PLAY_TOGGLE })
    } else {
      dispatch({ type: transport.ADVANCE_PLAYHEAD, bar, barCount })
    }
  }
}
export const transportStop = () => {
  return (dispatch) => {
    dispatch(transportConsolidateRecording())
    dispatch({ type: transport.STOP })
  }
}
export const transportRecord = () => {
  return (dispatch, getState) => {
    // If we are ending a recording, consolidate the recorded clip before toggling!
    if (getState().transport.recording)
      dispatch(transportConsolidateRecording())

    // Toggle recording!
    dispatch({ type: transport.RECORD })
  }
}
export const transportConsolidateRecording = () => {
  return (dispatch, getState) => {
    let state = getState()
    if (state.transport.recording) {
      let clipID = state.transport.targetClipID
      let notesInClip = state.phrase.present.notes.filter(note => note.clipID === clipID).length
      if (notesInClip) {
        dispatch({ type: phrase.CONSOLIDATE_CLIP, clipID })
      } else if (Number.isInteger(clipID)) {
        dispatch(UndoActions.undo())
      }
    }
  }
}
export const transportSetTempo = () => ({type: transport.SET_TEMPO})


// ============================================================================
// Transport Reducer
// ============================================================================
let defaultState = {
  playing: false,
  playhead: 0.000,
  recording: false,
  targetClipID: null,
}

export default function reduceTransport(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case transport.PLAY_TOGGLE:
      return u({
        playing: !state.playing,
        recording: false,
        targetClipID: null,
      }, state)

    // ------------------------------------------------------------------------
    case transport.REWIND_PLAYHEAD:
      return u({
        playhead: Math.max(0, Math.round(state.playhead + 0.25) - 1.0)
      }, state)

    // ------------------------------------------------------------------------
    case transport.MOVE_PLAYHEAD:
      let playhead = Math.max(action.bar, 0)
          playhead = Math.min(playhead, action.barCount)
      return u({
        playhead
      }, state)

    // ------------------------------------------------------------------------
    case transport.ADVANCE_PLAYHEAD:
      return u({
        playhead: Math.min(action.barCount, Math.floor(state.playhead) + 1.0)
      }, state)

    // ------------------------------------------------------------------------
    case transport.RECORD:
      return u({
        recording: !state.recording,
        playing: state.playing || !state.recording,
        targetClipID: false,
      }, state)

    // ------------------------------------------------------------------------
    // When recording, we create a new target clip for all recorded notes
    case phrase.CREATE_CLIP:
      if (action.payload.newRecording) {
        return u({
          targetClipID: action.payload.recordingTargetClipID,
        }, state)
      }
      return state

    // ------------------------------------------------------------------------
    case transport.STOP:
      if (!state.playing) {
        return u({
          playhead: 0.000,
        }, state)
      }

      return u({
        playing: false,
        recording: false,
        targetClipID: null,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE:
    case phrase.LOAD_START:
      return defaultState

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
