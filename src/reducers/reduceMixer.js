// ============================================================================
// Mixer Controls
// ============================================================================

import u from 'updeep'
import { zoomInterval } from '../helpers/intervalHelpers.js'
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { mixer } from '../actions/actions.js'

import marioNotes from '../helpers/marioNotes.js'

let defaultState = {
  width: 1000,
  height: 500,
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

export default function reduceMixer(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.RESIZE_WIDTH:
      return Object.assign({}, state, {
        width: action.width
      })

    // ------------------------------------------------------------------------
    // Track absolute height to control vertical scrollbar overflow
    case mixer.RESIZE_HEIGHT:
      return Object.assign({}, state, {
        height: action.height
      })

    // ------------------------------------------------------------------------
    case mixer.SCROLL_X:
      return Object.assign({}, state,
        action.min === null ? {} : {xMin: Math.max(0.0, action.min)},
        action.max === null ? {} : {xMax: Math.min(1.0, action.max)}
      )

    // ------------------------------------------------------------------------
    case mixer.SCROLL_Y:
      return Object.assign({}, state,
        action.min === null ? {} : {yMin: Math.max(0.0, action.min)},
        action.max === null ? {} : {yMax: Math.min(1.0, action.max)}
      )

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

