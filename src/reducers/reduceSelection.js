import u from 'updeep'
import { phrase } from '../actions/actions.js'

// ============================================================================
// Selection Reducer
// ============================================================================
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
