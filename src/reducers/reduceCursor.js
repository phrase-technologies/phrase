// ============================================================================
// Cursor Controls
// ============================================================================

import { cursor } from '../actions/actions.js';

let defaultState = {
  icon: null
};

export default function reduceCursor(state = defaultState, action) {
  switch (action.type)
  {
    case cursor.DEFAULT:        return Object.assign({}, state, {icon: 'default'})
    case cursor.DRAG:           return Object.assign({}, state, {icon: 'grabbing'})
    case cursor.RESIZE_COLUMN:  return Object.assign({}, state, {icon: 'colresize'})
    case cursor.RESIZE_ROW:     return Object.assign({}, state, {icon: 'rowresize'})
    case cursor.RESIZE_X:       return Object.assign({}, state, {icon: 'xresize'})
    case cursor.RESIZE_Y:       return Object.assign({}, state, {icon: 'yresize'})
    case cursor.RESIZE_LEFT:    return Object.assign({}, state, {icon: 'left'})
    case cursor.RESIZE_RIGHT:   return Object.assign({}, state, {icon: 'right'})
    case cursor.RESIZE_TOP:     return Object.assign({}, state, {icon: 'top'})
    case cursor.RESIZE_BOTTOM:  return Object.assign({}, state, {icon: 'bottom'})
    case cursor.DROP:
    case cursor.CLEAR:          return Object.assign({}, state, {icon: null})

    default:
      return state;
  }  
}
