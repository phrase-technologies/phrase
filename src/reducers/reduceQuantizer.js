import { quantizer } from 'actions/actions'


export const quantizerDivisions = [
  { label: '1/1',   val: 1 },
  { label: '1/2',   val: 0.5 },
  { label: '1/4',   val: 0.25 },
  { label: '1/8',   val: 0.125 },
  { label: '1/16',  val: 0.0625 },
  { label: '1/32',  val: 0.03125 },
  { label: '1/64',  val: 0.015625 },
]

export const changeQuantizeDivision = (division) => {
  return (dispatch) => {
    dispatch({ type: quantizer.CHANGE_DIVISION, payload: { division }})
  }
}


// ============================================================================
// Quantizer Reducer
// ============================================================================

export const defaultState = {
  division: 0.25,
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
