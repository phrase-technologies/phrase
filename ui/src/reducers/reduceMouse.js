import { mouse } from 'actions/actions'

let initialState = {
  x: 0, y: 0,
  downX: 0, downY: 0,
  tooltip: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case mouse.UPDATE:
      return {
        ...state,
        x: action.payload.clientX,
        y: action.payload.clientY,
      }

    case mouse.DOWN:
      return {
        ...state,
        downX: action.payload.clientX,
        downY: action.payload.clientY,
      }

    case mouse.TOGGLE_TOOLTIP:
      return {
        ...state,
        tooltip: action.payload
      }

    default:
      return state
  }
}
