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
    // ------------------------------------------------------------------------
    case pianoroll.CREATE_CLIP:
      return reduceCreateClip(
        state,
        action
      )

    // ------------------------------------------------------------------------
    case pianoroll.CREATE_NOTE:
      // Create Clip first if necessary
      var newState = reduceCreateClip(
        state,
        action
      )
      // Create Note
      return reduceCreateNote(
        newState,
        action
      )

    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case pianoroll.RESIZE_WIDTH:
      return restrictTimelineZoom(
        Object.assign({}, state, {
          width: action.width
        })
      );

    // ------------------------------------------------------------------------
    // Track absolute height to ensure the keyboard doesn't get too small or large
    case pianoroll.RESIZE_HEIGHT:
      return restrictKeyboardZoom(
        Object.assign({}, state, {
          height: action.height
        })
      );

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_X:
      return restrictTimelineZoom(
        Object.assign({}, state,
          action.min === null ? {} : {xMin: Math.max(0.0, action.min)},
          action.max === null ? {} : {xMax: Math.min(1.0, action.max)}
        )
      );

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_Y:
      return restrictKeyboardZoom(
        Object.assign({}, state,
          action.min === null ? {} : {yMin: Math.max(0.0, action.min)},
          action.max === null ? {} : {yMax: Math.min(1.0, action.max)}
        )
      );

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_START:
      return Object.assign({}, state, {
        selectionStartX: action.x,
        selectionStartY: action.y
      });

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_END:
      return Object.assign({}, state, {
        selectionEndX: action.x,
        selectionEndY: action.y
      });

    // ------------------------------------------------------------------------
    case pianoroll.MOVE_CURSOR:
      var newCursor = action.percent < 0.0 ? null : action.percent;
          newCursor = action.percent > 1.0 ? null : newCursor;

      return Object.assign({}, state, {
        cursor: newCursor
      });

    // ------------------------------------------------------------------------
    case pianoroll.SELECT_NOTE:
      return u.updateIn(
        ['clips', '*', 'notes', '*'],
        u.ifElse(
          (note) => note.id == action.id,
          (note) => u({selected: true}, note),
          (note) => u({selected: false}, note)          
        ),
        state
      )

    default:
      return state;
  }  
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  var foundClip = state.clips.find((clip) => {
    return action.bar >= clip.start && action.bar < clip.end
  })
  if (foundClip)
    return state

  // Create new clip
  var snappedClipStart = Math.floor(action.bar);
  var newClip = {
    id:         state.clipAutoIncrement,
    start:      snappedClipStart,
    end:        snappedClipStart + 1,
    offset:     0.00,
    loopLength: 1.00,
    notes:      []
  }

  return u({
    clips: uAppend(newClip, clipSortComparison),
    clipAutoIncrement: uIncrement(1)
  }, state)  
}

function reduceCreateNote(state, action) {
  // Skip if no clip available
  var foundClip = state.clips.find((clip) => {
    return action.bar >= clip.start && action.bar < clip.end
  })
  if (!foundClip)
    return state

  // Skip if note already exists
  // TODO - NEED TO ACCOUNT FOR LOOPING
  var foundNote = foundClip.notes.find((note) => {
    return action.bar >= note.start && action.bar < note.end
  })
  if (foundNote)
    return state
  
  // Insert note, snap to same length as most previously created note
  // TODO - NEED TO ACCOUNT FOR LOOPING
  var snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast;
  var newNote = {
    id:     state.noteAutoIncrement,
    keyNum: action.key,
    start:  snappedNoteStart - foundClip.start,
    end:    snappedNoteStart - foundClip.start + state.noteLengthLast
  }

  var updatedClip = u({
    notes: uAppend(newNote, noteSortComparison)
  }, foundClip)

  return u({
    clips: uReplace(foundClip, updatedClip),
    noteAutoIncrement: uIncrement(1)
  }, state)
}

// Comparison function for sorting notes a and b by their start time. Usage: note.sort(noteSortComparison);
function noteSortComparison(a, b) {
  return a.start - b.start;
}

function clipSortComparison(a, b) {
  return a.start - b.start;
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
