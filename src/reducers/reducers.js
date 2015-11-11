import { combineReducers } from 'redux';

// ============================================================================
// Transport Controls
// ============================================================================

import { TRANSPORT_PLAY,
         TRANSPORT_STOP,
         TRANSPORT_REWIND,
         TRANSPORT_RECORD,
         TRANSPORT_TEMPO } from '../actions/actions.js';

function transport(state = {}, action) {
  switch (action.type) {
    case TRANSPORT_PLAY:
      return Object.assign({}, state, {playing: true});
    case TRANSPORT_STOP:
      return Object.assign({}, state, {playing: false});
    case TRANSPORT_RECORD:
      return Object.assign({}, state, {recording: !state.recording});
    case TRANSPORT_TEMPO:
      return Object.assign({}, state, {tempo: action.tempo});
    default:
      return state;
  }
}

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
function pianoRoll(state = defaultPianoRollState, action) {
  switch (action.type) {
    case PIANOROLL_SCROLL_X:
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
    case PIANOROLL_SCROLL_Y:
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
    default:
      return state;
  }  
}

const musicApp = combineReducers({
  transport,
  pianoRoll
});

export default musicApp;