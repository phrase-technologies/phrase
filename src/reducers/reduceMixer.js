import u from 'updeep'
import {
  zoomInterval,
  shiftInterval,
  restrictTimelineZoom,
  maxBarWidth,
} from 'helpers/intervalHelpers'
import { getTracksHeight } from 'helpers/trackHelpers'
import { mixer, transport } from 'actions/actions'

// ============================================================================
// Mixer Action Creators
// ============================================================================
export const mixerScrollY = ({ min, max, delta, fulcrum }) => ({ type: mixer.SCROLL_Y, min, max, delta, fulcrum })
export const mixerScrollX = ({ min, max, delta, fulcrum, isAuto }) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: mixer.SCROLL_X, min, max, barCount, delta, fulcrum })
    if (state.mixer.autoScroll && state.transport.playing && !isAuto)
      dispatch({ type: mixer.DISABLE_AUTOSCROLL })
  }
}
export const mixerResizeHeight = (height) => {
  // We need to know the height of the phrase-tracks in the mixer - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let mixerContentHeight = getTracksHeight(state.phrase.present.tracks)
    dispatch({ type: mixer.RESIZE_HEIGHT, height, mixerContentHeight })
  }
}
export const mixerResizeWidth = (width) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: mixer.RESIZE_WIDTH, width, barCount })
  }
}
export const mixerSelectionStart = (x, y) => ({type: mixer.SELECTION_BOX_START,  x, y})
export const mixerSelectionEnd   = (x, y) => ({type: mixer.SELECTION_BOX_RESIZE, x, y})
export const mixerMoveCursor  = (percent) => ({type: mixer.MOVE_CURSOR, percent})


// ============================================================================
// Mixer Reducer
// ============================================================================
let defaultState = {
  width: 1000,
  height: 500,
  xMin: 0.000,
  xMax: 0.500,
  yMin: 0.000,
  yMax: 0.0625,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null,
  autoScroll: true,
}

export default function reduceMixer(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.RESIZE_WIDTH:
      state = u({
        width: action.width
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    // Track absolute height to control vertical scrollbar overflow
    case mixer.RESIZE_HEIGHT:
      state = u({
        height: action.height
      }, state)

      if (action.mixerContentHeight <= state.height) {
        return u({
          yMin: 0.000,
          yMax: 1.000
        }, state)
      }

      let fulcrum
           if (state.yMin < 0.001) { fulcrum = 0.000 }
      else if (state.yMax > 0.999) { fulcrum = 1.000 }

      let oldWindow = state.yMax - state.yMin
      let newWindow = state.height / action.mixerContentHeight
      let zoomFactor = newWindow/oldWindow
      let [newMin, newMax] = zoomInterval([state.yMin, state.yMax], zoomFactor, fulcrum)

      return u({
        yMin: newMin,
        yMax: newMax
      }, state)

    // ------------------------------------------------------------------------
    case mixer.SCROLL_X:
      // Zoom X
      if (action.fulcrum !== undefined) {
        let zoomFactor = (action.delta + 500) / 500
        let [newMin, newMax] = zoomInterval([state.xMin, state.xMax], zoomFactor, action.fulcrum)
        let oldBarWidth = state.width / (state.xMax - state.xMin) / action.barCount

        // Already at limit - bypass
        if (zoomFactor < 1 && oldBarWidth > maxBarWidth - 0.0001)
          return state

        state = u({
          xMin: Math.max(0.0, newMin),
          xMax: Math.min(1.0, newMax),
        }, state)
        return restrictTimelineZoom(state, action.barCount)
      }

      // Regular Scroll X
      if (action.delta !== undefined) {
        let barWindow = state.xMax - state.xMin
        let barStepSize = action.delta / state.width * barWindow
        let [newBarMin, newBarMax] = shiftInterval([state.xMin, state.xMax], barStepSize)
        state = u({
          xMin: Math.max(0.0, newBarMin),
          xMax: Math.min(1.0, newBarMax),
        }, state)
      } else {
        state = u({
          xMin: action.min === undefined ? state.xMin : Math.max(0.0, action.min),
          xMax: action.max === undefined ? state.xMax : Math.min(1.0, action.max)
        }, state)
      }
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    case mixer.SCROLL_Y:
      if (action.delta !== undefined) {
        let keyWindow = state.yMax - state.yMin
        let keyStepSize = action.delta / state.height * keyWindow
        let [newKeyMin, newKeyMax] = shiftInterval([state.yMin, state.yMax], keyStepSize)
        return u({
          yMin: Math.max(0.0, newKeyMin),
          yMax: Math.min(1.0, newKeyMax),
        }, state)
      }

      return u({
        yMin: action.min === null ? state.yMin : Math.max(0.0, action.min),
        yMax: action.max === null ? state.yMax : Math.min(1.0, action.max)
      }, state)

    // ------------------------------------------------------------------------
    case mixer.SELECTION_BOX_START:
      return Object.assign({}, state, {
        selectionStartX: action.x,
        selectionStartY: action.y,
        selectionEndX: action.x,
        selectionEndY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.SELECTION_BOX_RESIZE:
      return Object.assign({}, state, {
        selectionEndX: action.x,
        selectionEndY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.MOVE_CURSOR:
      return Object.assign({}, state, {
        cursor: action.percent
      })

    // ------------------------------------------------------------------------
    case mixer.DISABLE_AUTOSCROLL:
      return u({ autoScroll: false }, state)

    // ------------------------------------------------------------------------
    case transport.PLAY_TOGGLE:
    case mixer.ENABLE_AUTOSCROLL:
      return u({ autoScroll: true }, state)

    // ------------------------------------------------------------------------
    default:
      return state

  }
}
