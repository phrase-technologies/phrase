// ============================================================================
// Mixer Controls
// ============================================================================

import u from 'updeep'
import { zoomInterval } from '../helpers/helpers.js'
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { mixer } from '../actions/actions.js'

import marioNotes from '../helpers/marioNotes.js'

let defaultState = {
  width: 1000,
  xMin: 0.000,
  xMax: 0.0625,
  yMin: 0.000,
  yMax: 0.0625,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null,
  playhead: 0.000
}

const maxBarWidth = 1000

export default function reduceMixer(state = defaultState, action) {
  switch (action.type)
  {
    // ========================================================================
    // Width (pixels)
    // ========================================================================
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.RESIZE_WIDTH:
    {
      var newState = Object.assign({}, state, {width: action.width})
      return restrictTimelineZoom(newState)
    }

    // ========================================================================
    // Scroll X
    // ========================================================================
    case mixer.SCROLL_X:
    {
      var stateChanges = {}

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.xMin = action.min < 0.0 ? 0.0 : action.min
      if( action.max !== null )
        stateChanges.xMax = action.max > 1.0 ? 1.0 : action.max
      var newState = Object.assign({}, state, stateChanges)

      // Make sure timeline doesn't zoom too close
      return restrictTimelineZoom(newState)
    }

    // ========================================================================
    // Scroll Y
    // ========================================================================
    case mixer.SCROLL_Y:
    {
      var stateChanges = {}

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.yMin = action.min < 0.0 ? 0.0 : action.min
      if( action.max !== null )
        stateChanges.yMax = action.max > 1.0 ? 1.0 : action.max
      var newState = Object.assign({}, state, stateChanges)

      // Restrict min/max zoom against the mixer's height (ensure keyboard doesn't get too small or large)
      return newState
    }

    // ========================================================================
    // Selection Box Start Position
    // ========================================================================
    case mixer.SELECTION_START:
    {
      return Object.assign({}, state, {selectionStartX: action.x, selectionStartY: action.y})
    }

    // ========================================================================
    // Selection Box End Position
    // ========================================================================
    case mixer.SELECTION_END:
    {
      return Object.assign({}, state, {selectionEndX: action.x, selectionEndY: action.y})
    }

    // ========================================================================
    // Cursor
    // ========================================================================
    case mixer.MOVE_CURSOR:
    {
      var stateChanges = {};

      stateChanges.cursor = action.percent < 0.0 ? null : action.percent;
      stateChanges.cursor = action.percent > 1.0 ? null : stateChanges.cursor;

      // Make sure new state exceeds minimum positive range
      return Object.assign({}, state, stateChanges);
    }

    // ========================================================================
    // Playhead
    // ========================================================================
    case mixer.MOVE_PLAYHEAD:
      // TODO
      // TODO
      // TODO

    // ========================================================================
    // DEFAULT
    // ========================================================================
    default:
    {
      return state
    }
  }  
}

// Make sure timeline doesn't zoom too close
function restrictTimelineZoom(newState) {
  var timelineWidth = newState.width / (newState.xMax - newState.xMin)

  // TODO: This is hardcoded to 64 bars.
  // Use Reselect https://github.com/rackt/reselect#motivation-for-memoized-selectors 
  var barWidth = timelineWidth / 64
  if( barWidth > maxBarWidth )
    [newState.xMin, newState.xMax] = zoomInterval([newState.xMin, newState.xMax], barWidth/maxBarWidth)
  return newState
}
