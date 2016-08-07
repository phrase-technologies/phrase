import { quantizer } from 'actions/actions'


let defaultState = {
  division: '1/4',
}

export const changeQuantizeDivision = (division) => {
  return (dispatch) => {
    dispatch({ type: quantizer.CHANGE_DIVISION, payload: { division }})
  }
}

export default function reduceQuantizer(state = defaultState, action) {
  switch (action.type) {
    case quantizer.CHANGE_DIVISION:
      return {
        ...state,
        division: action.payload.division,
      }
    default:
      return state
  }
}
