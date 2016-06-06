import { arrangeTool } from 'actions/actions'

export let arrangeToolSelect = tool => ({ type: arrangeTool.SELECT, payload: tool })

let defaultState = `pointer`

export default function reduceArrangeTool(state = defaultState, action) {
  switch (action.type) {
    case arrangeTool.SELECT:
      return action.payload
    default:
      return state
  }
}
