import u from 'updeep'
import { phrase, transport } from 'actions/actions'
import { ActionCreators as UndoActions } from 'redux-undo'

import { pianorollScrollX } from 'reducers/reducePianoroll'
import { mixerScrollX } from 'reducers/reduceMixer'

const getNewScroll = ({ min, max, playhead, barCount }) => {
  let viewWidth = max - min
  let playheadPercent = playhead / barCount
  if (max < 1 && ((max - playheadPercent) / viewWidth) < 0) {
    let newMax = Math.min(1, playheadPercent + viewWidth)
    let offset = (newMax < 1) ? 0.05 * viewWidth : 0
    return { min: newMax - viewWidth - offset, max: newMax - offset }
  }
  else if (min > 0 && ((playheadPercent - min) / viewWidth) < 0) {
    let newMin = Math.max(0, playheadPercent - viewWidth)
    let offset = (newMin > 0) ? 0.05 * viewWidth : 0
    return { min: newMin + offset, max: newMin + viewWidth + offset }
  }
  return null
}

const adjustPianoMixerScroll = () => {
  return (dispatch, getState) => {
    let state = getState()
    let playhead = state.transport.playhead
    let barCount = state.phrase.present.barCount

    let adjustment = getNewScroll({
      min: state.pianoroll.xMin,
      max: state.pianoroll.xMax,
      playhead,
      barCount,
    })
    if (adjustment) dispatch(pianorollScrollX(adjustment))

    adjustment = getNewScroll({
      min: state.mixer.xMin,
      max: state.mixer.xMax,
      playhead,
      barCount,
    })
    if (adjustment) dispatch(mixerScrollX(adjustment))
  }
}

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
    dispatch(adjustPianoMixerScroll())
  }
}
export const transportMovePlayhead = (bar, snap = false) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    bar = snap ? Math.round(bar * 4) * 0.25 : bar
    let barCount = state.phrase.present.barCount
    dispatch({ type: transport.MOVE_PLAYHEAD, bar, barCount })
    dispatch(adjustPianoMixerScroll())
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
    dispatch(adjustPianoMixerScroll())
  }
}
export const transportStop = () => {
  return (dispatch) => {
    dispatch(transportConsolidateRecording())
    dispatch({ type: transport.STOP })
    dispatch(adjustPianoMixerScroll())
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
        // this offsets the lag of scheduling the note that is at the same
        // position as the playhead
        playhead: !state.playing ? state.playhead - 0.05 : state.playhead
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
