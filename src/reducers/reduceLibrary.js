import { library } from 'actions/actions'
import { api } from 'helpers/ajaxHelpers'
import { push } from 'react-router-redux'

export const librarySave = () => {
  return async (dispatch, getState) => {
    let phraseState = getState().phrase
    let { phraseId } = await api({ endpoint: `save`, body: { phraseState }})
    console.log(phraseId)
    dispatch({ type: library.SAVE, payload: { phraseId } })
    dispatch(push(`/phrase/${localStorage.username}/${phraseId}`))
  }
}

export const libraryLoadAll = () => {
  return async (dispatch) => {
    let { phrases } = await api({ endpoint: `load`, })
    dispatch({ type: library.LOAD_ALL, payload: phrases })
  }
}

export const librarySearch = value => ({ type: library.SEARCH, payload: value })

let defaultState = {
  phrases: [],
  searchTerm: ``,
}

export default function reduceLibrary(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case library.LOAD_ALL:
      return {
        ...state,
        phrases: action.payload
      }

    case library.SEARCH:
      return {
        ...state,
        searchTerm: action.payload,
      }

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
