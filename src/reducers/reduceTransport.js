import u from 'updeep'
import { phrase, transport } from '../actions/actions.js'
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
export const transportMovePlayhead = (bar, snap = false) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    bar = snap ? Math.round(bar * 4) * 0.25 : bar
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
    // Ending a recording - consolidate the recorded clip before toggling!
    if (getState().transport.recording) {
      dispatch(transportConsolidateRecording())
    }

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
export const transportCountIn = () => ({type: transport.COUNT_IN})
export const transportMetronome = () => ({type: transport.METRONOME})


// ============================================================================
// Transport Reducer
// ============================================================================
let defaultState = {
  playing: false,
  playhead: 0.000,
  recording: false,
  countIn: true,
  metronome: false,
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
      return u({
        playhead: state.recording || state.playing
          ? Math.min(action.bar, action.barCount)
          : Math.max(Math.min(action.bar, action.barCount), 0)
      }, state)

    // ------------------------------------------------------------------------
    case transport.ADVANCE_PLAYHEAD:
      return u({
        playhead: Math.min(action.barCount, Math.floor(state.playhead) + 1.0)
      }, state)

    // ------------------------------------------------------------------------
    case transport.RECORD:
      let newPlayhead = state.playhead
      // Start recording
      if (!state.recording) {
        // Metronome count in
        if (!state.playing && state.countIn)
          newPlayhead = Math.floor(state.playhead) - 1.0
      }
      return u({
        recording: !state.recording,
        playing: state.playing || !state.recording,
        targetClipID: false,
        playhead: newPlayhead,
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
    case transport.COUNT_IN:
      return u({
        countIn: !state.countIn,
      }, state)

    // ------------------------------------------------------------------------
    case transport.METRONOME:
      return u({
        metronome: !state.metronome,
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
