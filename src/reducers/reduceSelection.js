import _ from 'lodash'
import u from 'updeep'
import { phrase, pianoroll } from '../actions/actions.js'

// ============================================================================
// Selection Reducer
// ============================================================================
// Which clips and notes are currently selected by the user?
//
// If the user is performing drag and drop of the current selection, track
// those offsets here so we can show temporary previews of drag
//
// These parameters probably make more sense in reducePhrase.js, but have been
// pulled out because we don't want their changes recorded in undo/history.

export const defaultState = {
  clipSelectionIDs: [],
  clipSelectionTargetID: null,
  clipSelectionOffsetStart: null,
  clipSelectionOffsetEnd:   null,
  clipSelectionOffsetTrack: null,
  clipSelectionOffsetLooped: false,
  clipSelectionOffsetSnap: true,
  noteSelectionIDs: [],
  noteSelectionTargetID: null,
  noteSelectionOffsetStart: null,
  noteSelectionOffsetEnd: null,
  noteSelectionOffsetKey: null,
  noteSelectionOffsetSnap: true,
}

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.SELECT_CLIP:
      return u({
        noteSelectionIDs: [],
        clipSelectionIDs: action.union
          ? _.xor(state.clipSelectionIDs, [action.clipID])
          : [action.clipID]
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_NOTE:
      return u({
        clipSelectionIDs: [],
        noteSelectionIDs: action.union
          ? _.xor(state.noteSelectionIDs, [action.noteID])
          : [action.noteID]
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      return u({
        clipSelectionIDs: [],
        noteSelectionIDs: [],
      }, state)

    // ------------------------------------------------------------------------
    // Select a Phrase's Notes via the Pianoroll
    case pianoroll.SELECTION_BOX_APPLY:
      // Outer Bounds
      let left   = Math.min(action.selectionStartX, action.selectionEndX)
      let right  = Math.max(action.selectionStartX, action.selectionEndX)
      let top    = Math.max(action.selectionStartY, action.selectionEndY)
      let bottom = Math.min(action.selectionStartY, action.selectionEndY)

      // Find selected notes, even in loop iterations
      let selectedNoteIDs = action.renderedNotes
        .filter(note => {
          return (
            note.trackID === action.currentTrackID &&
            note.start  <  right &&
            note.end    >= left &&
            note.keyNum <= top + 1 &&
            note.keyNum >= bottom
          )
        })
        .map(note => note.id)
      selectedNoteIDs = _.uniq(selectedNoteIDs)

      // Replace or Union/Difference to existing selection?
      let updatedNoteSelectionIDs = action.union
        ? _.xor(state.noteSelectionIDs, selectedNoteIDs)
        : selectedNoteIDs

      return u({
        clipSelectionIDs: [],
        noteSelectionIDs: updatedNoteSelectionIDs,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DRAG_CLIP_SELECTION: {
      return u({
        clipSelectionTargetID: action.clipID,
        clipSelectionOffsetStart: action.start,
        clipSelectionOffsetEnd: action.end,
        clipSelectionOffsetTrack: action.track,
        clipSelectionOffsetLooped: action.looped,
        clipSelectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DRAG_NOTE_SELECTION: {
      return u({
        noteSelectionTargetID: action.noteID,
        noteSelectionOffsetStart: action.start,
        noteSelectionOffsetEnd: action.end,
        noteSelectionOffsetKey: action.key,
        noteSelectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        clipSelectionTargetID: null,
        clipSelectionOffsetStart: null,
        clipSelectionOffsetEnd: null,
        clipSelectionOffsetTrack: null,
        clipSelectionOffsetLooped: false,
        clipSelectionOffsetSnap: true,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION:
      return u({
        noteSelectionTargetID: null,
        noteSelectionOffsetStart: null,
        noteSelectionOffsetEnd: null,
        noteSelectionOffsetKey: null,
        noteSelectionOffsetSnap: true,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
