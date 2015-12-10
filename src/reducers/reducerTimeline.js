// ============================================================================
// Timeline
// ============================================================================

import { TIMELINE_CURSOR,
         TIMELINE_PLAYHEAD } from '../actions/actions.js';

let defaultState = {
  cursor:   null,
  playhead: 0.000
};

export default function timeline(state = defaultState, action) {
  switch (action.type)
  {
    // ========================================================================
    // Cursor
    // ========================================================================
    case TIMELINE_CURSOR:
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
    case TIMELINE_PLAYHEAD:

    // ========================================================================
    // DEFAULT
    // ========================================================================
    default:
    {
      return state;
    }
  }  
}

