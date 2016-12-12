import u from 'updeep'

// ============================================================================
// Clipboard Action Creators
// ============================================================================
export const clipboardCopy = () => {
  return (dispatch, getState) => {
    let {
      phrase: {
        tracks,
        clips,
        notes,
      },
      phraseMeta: {
        selectionType,
        trackSelectionID,
        clipSelectionIDs,
        noteSelectionIDs,
      }
    } = getState()

    let copiedTracks
    let copiedClips
    let copiedNotes

    if (selectionType === "notes") {
      copiedNotes = notes.filter()
    }

    dispatch({
      type: clipboard.COPY,
      payload: {
        tracks: [],
        clips: [],
        notes: [],
      }
    })
  }
}

// ============================================================================
// Clipboard Reducer
// ============================================================================
export const defaultState = {
  tracks: [],
  clips: [],
  notes: [],
}

export default function reduceClipboard(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case clipboard.CUT:
    case clipboard.COPY:
      return u({
        tracks: action.payload.tracks,
        clips: action.payload.clips,
        notes: action.payload.notes,
      }, state)

    default:
      return state
  }
}
