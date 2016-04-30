import { library } from 'actions/actions'
import { api } from 'helpers/ajaxHelpers'

export const librarySave = () => {
  return async (dispatch, getState) => {
    let phraseState = getState().phrase
    await api({ endpoint: `save`, body: { phraseState }})
    dispatch({ type: library.SAVE })
  }
}
export const libraryLoadAll = () => {
  return async (dispatch) => {
    let { phrases } = await api({ endpoint: `load`, })
    dispatch({ type: library.LOAD_ALL, payload: phrases })
  }
}

let defaultState = {
  phrases: []
}

export default function reduceLibrary(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case library.LOAD_ALL:
      return {
        phrases: action.payload
      }

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
