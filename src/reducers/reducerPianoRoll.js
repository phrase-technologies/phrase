// ============================================================================
// PianoRoll Controls
// ============================================================================

import { PIANOROLL_SCROLL_X,
         PIANOROLL_SCROLL_Y } from '../actions/actions.js';

let defaultPianoRollState = {
  barMin: 0.000,
  barMax: 0.250,
  keyMin: 0.500,
  keyMax: 1.000
};

export default function pianoRoll(state = defaultPianoRollState, action) {
  switch (action.type)
  {
    // ========================================================================
    // Scroll X
    // ========================================================================
    case PIANOROLL_SCROLL_X:
    {
      var stateChanges = {};

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.barMin = action.min < 0.0 ? 0.0 : action.min;
      if( action.max !== null )
        stateChanges.barMax = action.max > 1.0 ? 1.0 : action.max;

      // Make sure new state exceeds minimum positive range
      var newState = Object.assign({}, state, stateChanges);
      if( newState.barMax - newState.barMin > 0.03125 )
        return newState;
      else
        return state;
    }

    // ========================================================================
    // Scroll Y
    // ========================================================================
    case PIANOROLL_SCROLL_Y:
    {
      var stateChanges = {};

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.keyMin = action.min < 0.0 ? 0.0 : action.min;
      if( action.max !== null )
        stateChanges.keyMax = action.max > 1.0 ? 1.0 : action.max;

      // Make sure new state exceeds minimum positive range
      var newState = Object.assign({}, state, stateChanges);
      if( newState.keyMax - newState.keyMin < 12 / 88 )
        return state;
      else
        return newState;
    }

    // ========================================================================
    // DEFAULT
    // ========================================================================
    default:
    {
      return state;
    }
  }  
}

