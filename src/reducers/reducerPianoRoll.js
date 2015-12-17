// ============================================================================
// PianoRoll Controls
// ============================================================================

import { zoomInterval } from '../helpers/helpers.js';

import { PIANOROLL_SCROLL_X,
         PIANOROLL_SCROLL_Y,
         PIANOROLL_WIDTH,
         PIANOROLL_HEIGHT } from '../actions/actions.js';

let defaultState = {
  width: 1000,
  height: 500,
  barMin: 0.000,
  barMax: 0.250,
  keyMin: 0.500,
  keyMax: 1.000
};

const maxBarWidth = 1000;
const minKeyboardHeight =  800;
const maxKeyboardHeight = 1275;

export default function pianoRoll(state = defaultState, action) {
  console.log( action );
  switch (action.type)
  {
    // ========================================================================
    // Width (pixels)
    // ========================================================================
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case PIANOROLL_WIDTH:
    {
      var newState = Object.assign({}, state, {width: action.width});
      return restrictTimelineZoom(newState);
    }

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
      var newState = Object.assign({}, state, stateChanges);

      // Make sure timeline doesn't zoom too close
      return restrictTimelineZoom(newState);
    }

    // ========================================================================
    // Height (pixels)
    // ========================================================================
    // Used to ensure the keyboard doesn't get too small or large
    case PIANOROLL_HEIGHT:
    {
      var newState = Object.assign({}, state, {height: action.height});
      return restrictKeyboardZoom(newState);
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
      var newState = Object.assign({}, state, stateChanges);

      // Restrict min/max zoom against the piano-roll's height (ensure keyboard doesn't get too small or large)
      return restrictKeyboardZoom(newState);
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

// Restrict min/max zoom against the piano-roll's height (ensure keyboard doesn't get too small or large)
function restrictKeyboardZoom(newState) {
  var keyboardHeight = newState.height / (newState.keyMax - newState.keyMin);
  if( keyboardHeight < minKeyboardHeight )
    [newState.keyMin, newState.keyMax] = zoomInterval([newState.keyMin, newState.keyMax], keyboardHeight/minKeyboardHeight);
  if( keyboardHeight > maxKeyboardHeight )
    [newState.keyMin, newState.keyMax] = zoomInterval([newState.keyMin, newState.keyMax], keyboardHeight/maxKeyboardHeight);
  return newState;
}

// Make sure timeline doesn't zoom too close
function restrictTimelineZoom(newState) {
  var timelineWidth = newState.width / (newState.barMax - newState.barMin);

  // TODO: This is hardcoded to 64 bars.
  // Use Reselect https://github.com/rackt/reselect#motivation-for-memoized-selectors 
  var barWidth = timelineWidth / 64;
  if( barWidth > maxBarWidth )
    [newState.barMin, newState.barMax] = zoomInterval([newState.barMin, newState.barMax], barWidth/maxBarWidth);
  return newState;
}

