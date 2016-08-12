import { arrangeTool } from 'actions/actions'
import { tryAnalyticsEvent } from 'helpers/tryAnalytics'

export let arrangeToolSelect = tool => {
  tryAnalyticsEvent({
    eventName: "Changed Mouse Tool",
    location: "PIANOROLL",
    selectedTool: tool.toUpperCase(),
  })
  return { type: arrangeTool.SELECT, payload: tool }
}

let defaultState = `pencil`

export default function reduceArrangeTool(state = defaultState, action) {
  switch (action.type) {
    case arrangeTool.SELECT:
      return action.payload
    default:
      return state
  }
}
