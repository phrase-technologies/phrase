// ============================================================================
// Cursor Controls
// ============================================================================

import { CURSOR_SET_IMPLICIT,
         CURSOR_SET_EXPLICIT,
         CURSOR_TYPES } from '../actions/actions.js';

let defaultCursorState = {
  implicit: null,
  explicit: null
};

export default function cursor(state = defaultCursorState, action) {
  // Validate Cursor Type
  var cursorClass = CURSOR_TYPES[action.cursor];

  switch (action.type)
  {
    case CURSOR_SET_IMPLICIT:
      var stateChanges = {implicit: cursorClass};
      return Object.assign({}, state, stateChanges);

    case CURSOR_SET_EXPLICIT:
      var stateChanges = {explicit: cursorClass};
      return Object.assign({}, state, stateChanges);

    default:
      return state;
  }  
}

