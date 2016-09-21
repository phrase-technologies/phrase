import u from 'updeep'
import { comment } from 'actions/actions'

// ============================================================================
// Comment Action Creators
// ============================================================================
export const commentSelectionStart = ({ start, trackID }) => ({ type: comment.SELECTION_START, payload: { start, trackID } })
export const commentSelectionEnd = ({ end }) => ({ type: comment.SELECTION_END, payload: { end } })
export const commentSelectionClear = () => ({ type: comment.SELECTION_CLEAR })

// ============================================================================
// Comment Selection
// ============================================================================
export const defaultState = {
  commentId: null,
  commentTrackID: null,
  commentRangeStart: null,
  commentRangeEnd: null,
}

export default function reduceComment(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case comment.SELECTION_START:
      return u({
        commentRangeStart: 0.25*Math.round(4*action.payload.start),
        commentRangeEnd: null,
      }, state)

    // ------------------------------------------------------------------------
    case comment.SELECTION_END:
      return u({
        commentRangeEnd: 0.25*Math.round(4*action.payload.end),
      }, state)

    // ------------------------------------------------------------------------
    case comment.SELECTION_CLEAR:
      return defaultState

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
