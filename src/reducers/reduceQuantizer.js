import { quantizer } from 'actions/actions'


export const quantizerDivisions = [
  { label: '1/1 Note',   val: (1/1)   },
  { label: '1/2 Note',   val: (1/2)   },
  { label: '1/4 Note',   val: (1/4)   },
  { label: '1/8 Note',   val: (1/8)   },
  { label: '1/16 Note',  val: (1/16)  },
  { label: '1/32 Note',  val: (1/32)  },
  { label: '1/64 Note',  val: (1/64)  },
  { label: '' },
  { label: '1/2 Triplet',   val: (1/3)    },
  { label: '1/4 Triplet',   val: (1/6)    },
  { label: '1/8 Triplet',   val: (1/12)   },
  { label: '1/16 Triplet',  val: (1/24)   },
  { label: '1/32 Triplet',  val: (1/48)   },
  { label: '1/64 Triplet',  val: (1/96)   },
  { label: '1/128 Triplet', val: (1/192)  },
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
