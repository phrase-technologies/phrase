import u from 'updeep'
import { comment } from 'actions/actions'

// ============================================================================
// Comment Action Creators
// ============================================================================
export const commentSelectionStart = ({ start, trackID }) => ({ type: comment.SELECTION_START, payload: { start, trackID } })
export const commentSelectionEnd = ({ end }) => ({ type: comment.SELECTION_END, payload: { end } })

// ============================================================================
// Comment Selection
// ============================================================================
export const defaultState = {
  selectionCommentId: null,
  selectionTrackID: null,
  selectionStart: null,
  selectionEnd: null,
}

export default function reduceComment(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case comment.SELECTION_START:
      return u({
        selectionStart: action.payload.start,
      }, state)

    // ------------------------------------------------------------------------
    case comment.SELECTION_END: {
      let end = action.payload.end
      if (end < state.selectionStart) {
        return u({
          selectionStart: end,
          selectionEnd: state.selectionStart,
        }, state)
      }

      return u({
        selectionEnd: action.payload.end,
      }, state)
    }
    // ------------------------------------------------------------------------
    case comment.SELECTION_CLEAR:
      return defaultState

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
