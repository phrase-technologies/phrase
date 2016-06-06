import _ from 'lodash'
import u from 'updeep'
import { objectMergeKeyArrays } from 'helpers/arrayHelpers'
import { phrase, pianoroll, library } from 'actions/actions'
import { phraseMidiSelector } from 'selectors/selectorTransport.js'
import toMidiFile from 'helpers/toMidiFile'
import { saveAs } from 'file-saver'

// ============================================================================
// Phrase META Reducer
// ============================================================================
// This reducer contains all parameters that probably make more sense in
// reducePhrase.js, but have been pulled out because we don't want their changes
// recorded in undo/history.
//
// - Primary Key of Phrase `phraseId`
// - Which clips and notes are currently selected by the user?
// - If the user is performing drag and drop of the current selection, track
//   those offsets here so we can show temporary previews of drag
//

export const exportToMidi = () => {
  return async (dispatch, getState) => {
    let state = getState()
    let { phraseMeta: { phraseName }, phrase: { present: { tempo }}} = state
    let notes = phraseMidiSelector(state)

    saveAs(toMidiFile({ notes, tempo }), `${phraseName}.mid`)
  }
}

export const defaultState = {
  loading: true,
  saving: false,
  pristine: true,
  parentId: null,
  phraseId: null,
  phraseName: null,
  authorUsername: null,
  dateCreated: null,
  dateModified: null,
  loginReminder: false,
  rephraseReminder: false,
  selectionType: null,  // Can be "tracks", "clips", or "notes"
  selectionIDs: [],
  selectionTargetID: null,
  selectionOffsetStart: null,
  selectionOffsetEnd:   null,
  selectionOffsetTrack: null,
  selectionOffsetLooped: false,
  selectionOffsetSnap: true,
}

export default function reducePhraseMeta(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------

    case library.SAVE_NEW:
      return u({
        saving: "DO_NOT_RELOAD",
        phraseId: action.payload.phraseId,
        authorUsername: action.payload.authorUsername,
        dateCreated: action.payload.dateCreated,
        dateModified: action.payload.dateModified,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.LOAD_START:
      return u({
        loading: action.type,
      }, defaultState)  // Clear everything else to default!

    // ------------------------------------------------------------------------
    case phrase.LOAD_FINISH:
      return u({
        loading: false,
        parentId: action.payload.parentId,
        phraseId: action.payload.id,
        phraseName: action.payload.name,
        authorUsername: action.payload.username,
        dateCreated: action.payload.dateCreated,
        dateModified: action.payload.dateModified,
      }, defaultState)  // Clear everything else to default!

    // ------------------------------------------------------------------------
    case phrase.SAVE_START:
      return u({
        saving: true,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SAVE_FINISH:
      return u({
        loading: false,
        saving: false,
        pristine: true,
        dateModified: action.payload.timestamp,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.RENAME:
      return u({
        phraseName: action.name,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_TRACK:
      return u({
        selectionType: "tracks",
        selectionIDs: action.payload.union && state.selectionType === "tracks"
          ? _.xor(state.selectionIDs, [action.payload.trackID])
          : [action.payload.trackID]
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_CLIP:
      return u({
        selectionType: "clips",
        selectionIDs: action.payload.union && state.selectionType === "clips"
          ? _.xor(state.selectionIDs, [action.payload.clipID])
          : [action.payload.clipID]
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_NOTE:
      return {
        ...state,
        selectionType: "notes",
        selectionIDs: action.payload.union && state.selectionType === "notes"
          ? objectMergeKeyArrays(state.selectionIDs, { [action.payload.noteID]: [action.payload.loopIteration] })
          : { [action.payload.noteID]: [action.payload.loopIteration] }
      }

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      return u({
        selectionType: null,
        selectionIDs: [],
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
      let selectedNoteIDs = {}
      action.renderedNotes
        .filter(note => {
          return (
            note.trackID === action.currentTrackID &&
            note.start  <  right &&
            note.end    >= left &&
            note.keyNum <= top + 1 &&
            note.keyNum >= bottom
          )
        })
        .forEach(note => {
          let existingEntry = selectedNoteIDs[note.id]
          if (existingEntry)
            existingEntry.push(note.loopIteration)
          else
            selectedNoteIDs[note.id] = [note.loopIteration]
        })

      // Replace or Union/Difference to existing selection?
      let updatedNoteSelectionIDs = action.union
        ? objectMergeKeyArrays(state.selectionIDs, selectedNoteIDs)
        : selectedNoteIDs

      return {
        ...state,
        selectionType: "notes",
        selectionIDs: updatedNoteSelectionIDs,
      }

    // ------------------------------------------------------------------------
    case phrase.DRAG_CLIP_SELECTION: {
      return u({
        selectionTargetID: action.clipID,
        selectionOffsetStart: action.start,
        selectionOffsetEnd: action.end,
        selectionOffsetTrack: action.track,
        selectionOffsetLooped: action.looped,
        selectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DRAG_NOTE_SELECTION: {
      return u({
        selectionTargetID: action.noteID,
        selectionOffsetStart: action.start,
        selectionOffsetEnd: action.end,
        selectionOffsetKey: action.key,
        selectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        selectionTargetID: null,
        selectionOffsetStart: null,
        selectionOffsetEnd: null,
        selectionOffsetTrack: null,
        selectionOffsetLooped: false,
        selectionOffsetSnap: true,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION:
      return u({
        selectionTargetID: null,
        selectionOffsetStart: null,
        selectionOffsetEnd: null,
        selectionOffsetKey: null,
        selectionOffsetSnap: true,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE:
      return u({
        loading: action.type,
      }, defaultState)

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE_LOADED:
      return u({
        saving: false,
        loading: false,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.REPHRASE:
      return u({
        pristine: false,
        saving: true,
        loading: action.type,
        parentId: state.phraseId,
        phraseId: null,
        authorUsername: action.payload.authorUsername,
        loginReminder: !action.payload.authorUsername,
        rephraseReminder: false,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.LOGIN_REMINDER:
      return u({
        loginReminder: action.payload.show,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.REPHRASE_REMINDER:
      return u({
        rephraseReminder: action.payload.show,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.PRISTINE:
      return u({
        pristine: action.payload.pristine,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}