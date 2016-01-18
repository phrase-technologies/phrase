// ============================================================================
// Pianoroll Controls
// ============================================================================

import u from 'updeep';
import { zoomInterval } from '../helpers/helpers.js';
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { pianoroll } from '../actions/actions.js';

import marioNotes from '../helpers/marioNotes.js';

let defaultState = {
  width: 1000,
  height: 500,
  xMin: 0.000,
  xMax: 0.0625,
  yMin: 0.250,
  yMax: 0.750,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null,
  // notes: marioNotes,
  clips: [],
  noteLengthLast: 0.25,
  noteAutoIncrement: 0,
  clipAutoIncrement: 0
};

const maxBarWidth = 1000;
const minKeyboardHeight =  800;
const maxKeyboardHeight = 1275 + 300;

export default function reducePianoroll(state = defaultState, action) {
  switch (action.type)
  {
    // ========================================================================
    // Create Note
    // ========================================================================
    case pianoroll.CREATE_NOTE:
    {
      // Existing clip matching?
      var foundClip = state.clips.find((clip) => {
        return action.bar >= clip.start && action.bar < clip.end
      })

      // Note instantiation - snap to the same length as the most previously created note
      var snappedClipStart = Math.floor(action.bar);
      var snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast;

      // Create new clip
      if (! foundClip) {
        var newNote = {
          id:     state.noteAutoIncrement,
          keyNum: action.key,
          start:  snappedNoteStart - snappedClipStart,
          end:    snappedNoteStart - snappedClipStart + state.noteLengthLast
        }

        var newClip = {
          id:         state.clipAutoIncrement,
          start:      snappedClipStart,
          end:        snappedClipStart + 1,
          offset:     0.00,
          loopLength: 1.00,
          notes:      [newNote]
        }
        var newState = u.updateIn(['clips'], uAppend(newClip, clipSortComparison), state)
            newState = u({noteAutoIncrement: uIncrement(1)}, newState)
            newState = u({clipAutoIncrement: uIncrement(1)}, newState)
        return newState
      }

      // Insert note into existing clip
      else {
        var newNote = {
          id:     state.noteAutoIncrement,
          keyNum: action.key,
          start:  snappedNoteStart - foundClip.start,
          end:    snappedNoteStart - foundClip.start + state.noteLengthLast
        }

        var updatedClip = u.updateIn(['notes'], uAppend(newNote, noteSortComparison), foundClip)
        var newState = u.updateIn(['clips'], uReplace(foundClip, updatedClip), state)
            newState = u({noteAutoIncrement: uIncrement(1)}, newState)
        return newState
      }
    }

    // ========================================================================
    // Width (pixels)
    // ========================================================================
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case pianoroll.RESIZE_WIDTH:
    {
      var newState = Object.assign({}, state, {width: action.width});
      return restrictTimelineZoom(newState);
    }

    // ========================================================================
    // Scroll X
    // ========================================================================
    case pianoroll.SCROLL_X:
    {
      var stateChanges = {};

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.xMin = action.min < 0.0 ? 0.0 : action.min;
      if( action.max !== null )
        stateChanges.xMax = action.max > 1.0 ? 1.0 : action.max;
      var newState = Object.assign({}, state, stateChanges);

      // Make sure timeline doesn't zoom too close
      return restrictTimelineZoom(newState);
    }

    // ========================================================================
    // Height (pixels)
    // ========================================================================
    // Used to ensure the keyboard doesn't get too small or large
    case pianoroll.RESIZE_HEIGHT:
    {
      var newState = Object.assign({}, state, {height: action.height});
      return restrictKeyboardZoom(newState);
    }

    // ========================================================================
    // Scroll Y
    // ========================================================================
    case pianoroll.SCROLL_Y:
    {
      var stateChanges = {};

      // Ensure each limit is valid
      if( action.min !== null )
        stateChanges.yMin = action.min < 0.0 ? 0.0 : action.min;
      if( action.max !== null )
        stateChanges.yMax = action.max > 1.0 ? 1.0 : action.max;
      var newState = Object.assign({}, state, stateChanges);
      // Restrict min/max zoom against the pianoroll's height (ensure keyboard doesn't get too small or large)
      return restrictKeyboardZoom(newState);
    }

    // ========================================================================
    // Selection Box Start Position
    // ========================================================================
    case pianoroll.SELECTION_START:
    {
      return Object.assign({}, state, {selectionStartX: action.x, selectionStartY: action.y});
    }

    // ========================================================================
    // Selection Box End Position
    // ========================================================================
    case pianoroll.SELECTION_END:
    {
      return Object.assign({}, state, {selectionEndX: action.x, selectionEndY: action.y});
    }

    // ========================================================================
    // Cursor
    // ========================================================================
    case pianoroll.MOVE_CURSOR:
    {
      var stateChanges = {};

      stateChanges.cursor = action.percent < 0.0 ? null : action.percent;
      stateChanges.cursor = action.percent > 1.0 ? null : stateChanges.cursor;

      // Make sure new state exceeds minimum positive range
      return Object.assign({}, state, stateChanges);
    }

    // ========================================================================
    // Note Selected
    // ========================================================================
    case pianoroll.SELECT_NOTE:
    {
      return u.updateIn(
        ['clips', '*', 'notes', '*'],
        u.ifElse(
          (note) => note.id == action.id,
          (note) => u({selected: true}, note),
          (note) => u({selected: false}, note)          
        ),
        state
      )
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

// Comparison function for sorting notes a and b by their start time. Usage: note.sort(noteSortComparison);
function noteSortComparison(a, b) {
  return a.start - b.start;
}

function clipSortComparison(a, b) {
  return a.start - b.start;
}

export function findClipForNewNote(clips, barCount, note) {
  return clips[0] || {};
}

// Restrict min/max zoom against the pianoroll's height (ensure keyboard doesn't get too small or large)
function restrictKeyboardZoom(newState) {
  var keyboardHeight = newState.height / (newState.yMax - newState.yMin);
  if( keyboardHeight < minKeyboardHeight )
    [newState.yMin, newState.yMax] = zoomInterval([newState.yMin, newState.yMax], keyboardHeight/minKeyboardHeight);
  if( keyboardHeight > maxKeyboardHeight )
    [newState.yMin, newState.yMax] = zoomInterval([newState.yMin, newState.yMax], keyboardHeight/maxKeyboardHeight);
  return newState;
}

// Make sure timeline doesn't zoom too close
function restrictTimelineZoom(newState) {
  var timelineWidth = newState.width / (newState.xMax - newState.xMin);

  // TODO: This is hardcoded to 64 bars.
  // Use Reselect https://github.com/rackt/reselect#motivation-for-memoized-selectors 
  var barWidth = timelineWidth / 64;
  if( barWidth > maxBarWidth )
    [newState.xMin, newState.xMax] = zoomInterval([newState.xMin, newState.xMax], barWidth/maxBarWidth);
  return newState;
}
