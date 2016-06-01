import _ from 'lodash'
import u from 'updeep'
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
