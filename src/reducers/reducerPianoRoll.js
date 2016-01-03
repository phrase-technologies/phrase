// ============================================================================
// PianoRoll Controls
// ============================================================================

import { zoomInterval } from '../helpers/helpers.js';

import { PIANOROLL_SCROLL_X,
         PIANOROLL_SCROLL_Y,
         PIANOROLL_WIDTH,
         PIANOROLL_HEIGHT,
         PIANOROLL_SELECTION_START,
         PIANOROLL_SELECTION_END,
         PIANOROLL_NEW_NOTE } from '../actions/actions.js';

let defaultState = {
  width: 1000,
  height: 500,
  barMin: 0.000,
  barMax: 0.0625,
  keyMin: 0.250,
  keyMax: 0.750,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  notes: [],
  noteLengthLast: 0.25
};

const maxBarWidth = 1000;
const minKeyboardHeight =  800;
const maxKeyboardHeight = 1275 + 300;

export default function pianoRoll(state = defaultState, action) {
  switch (action.type)
  {
    // ========================================================================
    // Create Note
    // ========================================================================
    case PIANOROLL_NEW_NOTE:
    {
      var snappedKey = Math.floor(action.key);
      var snappedBar = Math.floor(action.bar);
      var stateChanges = {
        notes: [
          ...state.notes,
          {
            key:   snappedKey,
            start: snappedBar,
            end:   snappedBar + state.noteLengthLast
          }
        ]
      };
      return Object.assign({}, state, stateChanges);
    }

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
    // Selection Box Start Position
    // ========================================================================
    case PIANOROLL_SELECTION_START:
    {
      return Object.assign({}, state, {selectionStartX: action.x, selectionStartY: action.y});
    }

    // ========================================================================
    // Selection Box End Position
    // ========================================================================
    case PIANOROLL_SELECTION_END:
    {
      return Object.assign({}, state, {selectionEndX: action.x, selectionEndY: action.y});
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

