import { samples } from 'actions/actions'

export default (state = [], action) => {
  switch (action.type) {
    case samples.LOADED:
      return [
        ...state,
        action.payload,
      ]

    default:
      return state
  }
}
