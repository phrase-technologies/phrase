import { samples } from 'actions/actions'

export default (state = [], action) => {
  switch (action.type) {
    case samples.LOADING: {
      let set = state.find(x => x.id === action.payload.id)
      if (set) {
        return [
          ...state.filter(x => x.id !== action.payload.id),
          { ...set, ...action.payload },
        ]
      }
      return [ ...state, action.payload ]
    }

    default:
      return state
  }
}
