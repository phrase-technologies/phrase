import { mouse } from 'actions/actions'

let initialState = { x: 0, y: 0 }

export default (state = initialState, action) => {
  switch (action.type) {
    case mouse.UPDATE:
      return {
        x: action.payload.clientX,
        y: action.payload.clientY,
      }

    default:
      return state
  }
}
