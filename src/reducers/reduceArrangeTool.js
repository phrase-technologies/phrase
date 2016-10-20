import u from 'updeep'
import {
  arrangeTool,
  comment,
} from 'actions/actions'
import { tryAnalyticsEvent } from 'helpers/tryAnalytics'

export const arrangeToolSelect = tool => {
  return (dispatch) => {
    tryAnalyticsEvent({
      eventName: "Changed Mouse Tool",
      location: "PIANOROLL",
      selectedTool: tool.toUpperCase(),
    })
    dispatch({ type: arrangeTool.SELECT, payload: tool })
  }
}

let defaultState = {
  currentTool: `pointer`,
  lastTool: `pointer`, // Keep track of any tool that's not the comment tool so we can revert back to it when a user is done commenting.
}

export default function reduceArrangeTool(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case arrangeTool.SELECT:
      return u({
        currentTool: action.payload,
        lastTool: state.currentTool === 'comment' ? state.lastTool : state.currentTool,
      }, state)

    // ------------------------------------------------------------------------
    case comment.SET_FOCUS:
      return u({
        currentTool: 'comment',
        lastTool: state.currentTool === 'comment' ? state.lastTool : state.currentTool,
      }, state)

    // ------------------------------------------------------------------------
    case comment.CLEAR_FOCUS:
      return u({
        currentTool: state.lastTool,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
