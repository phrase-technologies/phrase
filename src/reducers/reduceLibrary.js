import { library } from 'actions/actions'
import { api } from 'helpers/ajaxHelpers'
import { browserHistory } from 'react-router'

export const librarySave = () => {
  return async (dispatch, getState) => {
    let phraseState = getState().phrase
    let data = await api({ endpoint: `save`, body: { phraseState }})
    dispatch({ type: library.SAVE })
    browserHistory.push(`/edit/${localstorage.username}/`)
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
