import u from 'updeep'
import { zoomInterval,
         restrictTimelineZoom
       } from '../helpers/intervalHelpers.js'

import { pianoroll } from '../actions/actions.js'

// ============================================================================
// Pianoroll Action Creators
// ============================================================================
export const pianorollScrollX             = (min, max)        => ({type: pianoroll.SCROLL_X, min, max})
export const pianorollScrollY             = (min, max)        => ({type: pianoroll.SCROLL_Y, min, max})
export const pianorollResizeWidth         = (width)           => ({type: pianoroll.RESIZE_WIDTH,  width })
export const pianorollResizeHeight        = (height)          => ({type: pianoroll.RESIZE_HEIGHT, height })
export const pianorollSelectionBoxStart   = (x, y)            => ({type: pianoroll.SELECTION_BOX_START,  x, y})
export const pianorollSelectionBoxResize  = (x, y)            => ({type: pianoroll.SELECTION_BOX_RESIZE, x, y})
export const pianorollSelectionBoxApply   = (union)           => ({type: pianoroll.SELECTION_BOX_APPLY, union})
export const pianorollSetFocusWindow      = (clipID, tight)   => ({type: pianoroll.SET_FOCUS_WINDOW, clipID, tight})
export const pianorollMoveCursor          = (percent)         => ({type: pianoroll.MOVE_CURSOR, percent})


// ============================================================================
// Pianoroll Reducer
// ============================================================================
export const defaultState = {
  currentTrack: null,
  width: 1000,
  height: 500,
  xMin: 0.000,
  xMax: 0.250,
  yMin: 0.350,
  yMax: 0.650,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null
}

export default function reducePianoroll(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case pianoroll.RESIZE_WIDTH:
      state = u({
        width: action.width
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    // Track absolute height to ensure the keyboard doesn't get too small or large
    case pianoroll.RESIZE_HEIGHT:
      return restrictKeyboardZoom(
        u({
          height: action.height
        }, state)
      )

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_X:
      state = u({
        xMin: action.min === null ? state.xMin : Math.max(0.0, action.min),
        xMax: action.max === null ? state.xMax : Math.min(1.0, action.max)
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_Y:
      return restrictKeyboardZoom(
        u({
          yMin: action.min === null ? state.yMin : Math.max(0.0, action.min),
          yMax: action.max === null ? state.yMax : Math.min(1.0, action.max)
        }, state)
      )

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_BOX_START:
      return u({
        selectionStartX: action.x,
        selectionStartY: action.y,
        selectionEndX: action.x,
        selectionEndY: action.y
      }, state)

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_BOX_RESIZE:
      return u({
        selectionEndX: action.x,
        selectionEndY: action.y
      }, state)

    // ------------------------------------------------------------------------
    case pianoroll.MOVE_CURSOR:
      return u({
        cursor: action.percent
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}

// Restrict min/max zoom against the pianoroll's height (ensure keyboard doesn't get too small or large)
const minKeyboardHeight =  800
const maxKeyboardHeight = 1275 + 300
function restrictKeyboardZoom(state) {
  let yMin = state.yMin
  let yMax = state.yMax
  let keyboardHeight = state.height / (state.yMax - state.yMin)
  if (keyboardHeight < minKeyboardHeight) [yMin, yMax] = zoomInterval([state.yMin, state.yMax], keyboardHeight/minKeyboardHeight)
  if (keyboardHeight > maxKeyboardHeight) [yMin, yMax] = zoomInterval([state.yMin, state.yMax], keyboardHeight/maxKeyboardHeight)
  return u({
    yMin,
    yMax
  }, state)
}
