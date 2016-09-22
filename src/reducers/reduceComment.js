import u from 'updeep'
import { comment } from 'actions/actions'
import { uAppend } from 'helpers/arrayHelpers'

// ============================================================================
// Comment Action Creators
// ============================================================================
export const commentSelectionStart = ({ start, trackID }) => ({ type: comment.SELECTION_START, payload: { start, trackID } })
export const commentSelectionEnd = ({ end }) => ({ type: comment.SELECTION_END, payload: { end } })
export const commentSelectionClear = () => ({ type: comment.SELECTION_CLEAR })
export const commentCreate = (commentState) => ({ type: comment.COMMENT_CREATE, payload: commentState })

// ============================================================================
// Comment Selection
// ============================================================================
export const defaultState = {
  commentId: null,
  commentTrackID: null,
  commentRangeStart: null,
  commentRangeEnd: null,
  comments: [],
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
    case comment.COMMENT_CREATE:
      return u({
        commentId: action.payload.id,
        comments: uAppend(action.payload)
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
