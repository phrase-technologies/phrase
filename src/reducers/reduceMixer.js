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
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.RESIZE_WIDTH:
      return restrictTimelineZoom(
        Object.assign({}, state, {
          width: action.width
        })
      )

    // ------------------------------------------------------------------------
    case mixer.SCROLL_X:
      return restrictTimelineZoom(
        Object.assign({}, state,
          action.min === null ? {} : {xMin: Math.max(0.0, action.min)},
          action.max === null ? {} : {xMax: Math.min(1.0, action.max)}
        )
      );

    // ------------------------------------------------------------------------
    case mixer.SCROLL_Y:
      return Object.assign({}, state,
        action.min === null ? {} : {yMin: Math.max(0.0, action.min)},
        action.max === null ? {} : {yMax: Math.min(1.0, action.max)}
      )

    // ------------------------------------------------------------------------
    case mixer.SELECTION_START:
      return Object.assign({}, state, {
        selectionStartX: action.x,
        selectionStartY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.SELECTION_END:
      return Object.assign({}, state, {
        selectionEndX: action.x,
        selectionEndY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.MOVE_CURSOR:
      var newCursor = action.percent < 0.0 ? null : action.percent;
          newCursor = action.percent > 1.0 ? null : newCursor;

      return Object.assign({}, state, {
        cursor: newCursor
      });

    // ------------------------------------------------------------------------
    case mixer.MOVE_PLAYHEAD:
      // TODO
      // TODO
      // TODO

    // ------------------------------------------------------------------------
    default:
      return state

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
