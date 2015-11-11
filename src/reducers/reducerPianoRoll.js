// ============================================================================
// PianoRoll Controls
// ============================================================================

import { PIANOROLL_SCROLL_X,
         PIANOROLL_SCROLL_Y } from '../actions/actions.js';

let defaultPianoRollState = {
  barMin: 0.500,
  barMax: 1.000,
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
      var newBarMin = state.barMin + action.delta;
      var newBarMax = state.barMax + action.delta;
      if( newBarMin < 0.0 )
      {
        newBarMax -= newBarMin;
        newBarMin = 0.0;
      }
      if( newBarMax > 1.0 )
      {
        newBarMin -= (newBarMax - 1.0);
        newBarMax = 1.0;
      }
      var stateChanges = {barMin: newBarMin, barMax: newBarMax};
      return Object.assign({}, state, stateChanges);
    }

    // ========================================================================
    // Scroll Y
    // ========================================================================
    case PIANOROLL_SCROLL_Y:
    {
      var newKeyMin = state.keyMin + action.delta;
      var newKeyMax = state.keyMax + action.delta;
      if( newKeyMin < 0.0 )
      {
        newKeyMax -= newKeyMin;
        newKeyMin = 0.0;
      }
      if( newKeyMax > 1.0 )
      {
        newKeyMin -= (newKeyMax - 1.0);
        newKeyMax = 1.0;
      }
      var stateChanges = {keyMin: newKeyMin, keyMax: newKeyMax};
      return Object.assign({}, state, stateChanges);
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

