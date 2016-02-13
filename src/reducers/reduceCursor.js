// ============================================================================
// Cursor Controls
// ============================================================================
// Provide global cursor icon handling, useful for canvas (where DOM/CSS is
// no longer specifiable) and for Drag & Drop operations.
//
// There are two priority levels provided for these cursors:
// - Implicit, generally for use on hover (over canvas, most likely)
// - Explicit, generally for use on drag&drop, overrides implicit
//
import u from 'updeep'

import { cursor } from '../actions/actions.js'

let defaultState = {
  icon: null
};

export default function reduceCursor(state = defaultState, action) {
  // Implicit and Explicit are the only two priority levels for cursor state! Validate!
  if (!['implicit', 'explicit'].includes(action.priority))
    return state

  switch (action.type)
  {
    case cursor.DEFAULT:        return u({[action.priority]: 'default'}, state)
    case cursor.DRAG:           return u({[action.priority]: 'grabbing'}, state)
    case cursor.RESIZE_COLUMN:  return u({[action.priority]: 'colresize'}, state)
    case cursor.RESIZE_ROW:     return u({[action.priority]: 'rowresize'}, state)
    case cursor.RESIZE_X:       return u({[action.priority]: 'xresize'}, state)
    case cursor.RESIZE_Y:       return u({[action.priority]: 'yresize'}, state)
    case cursor.RESIZE_LEFT:    return u({[action.priority]: 'left'}, state)
    case cursor.RESIZE_RIGHT:   return u({[action.priority]: 'right'}, state)
    case cursor.RESIZE_TOP:     return u({[action.priority]: 'top'}, state)
    case cursor.RESIZE_BOTTOM:  return u({[action.priority]: 'bottom'}, state)
    case cursor.DROP:
    case cursor.CLEAR:          return u({[action.priority]: null}, state)

    default:
      return state
  }  
}
