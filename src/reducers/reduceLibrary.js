import { library } from 'actions/actions'
import { api } from 'helpers/ajaxHelpers'
import { push } from 'react-router-redux'
import { phrase } from '../actions/actions.js'
import { addAPIErrorNotification } from './reduceNotification'

export const librarySaveNew = () => {
  return async (dispatch, getState) => {
    dispatch({ type: phrase.SAVE_START })
    let state = getState()
    let { phraseId } = await api({
      endpoint: `save`,
      body: {
        parentId: state.phraseMeta.parentId,
        phraseState: state.phrase,
        phraseName: state.phraseMeta.phraseName,
      },
      failCallback: () => { dispatch(addAPIErrorNotification()) },
    })
    if (phraseId) {
      dispatch({
        type: library.SAVE_NEW,
        payload: {
          phraseId,
          authorUsername: getState().auth.user.username,
          dateCreated: Date.now(),
          dateModified: Date.now(),
        }
      })
      dispatch(push(`/phrase/${localStorage.username}/${phraseId}`))
      dispatch({ type: phrase.SAVE_FINISH, payload: { timestamp: Date.now() } })
    }
  }
}

export const libraryLoadAll = () => {
  return async (dispatch) => {
    let { phrases } = await api({
      endpoint: `load`,
      failCallback: () => { dispatch(addAPIErrorNotification()) },
    })
    if (phrases)
      dispatch({ type: library.LOAD_ALL, payload: phrases })
  }
}

export const librarySearch = value => ({ type: library.SEARCH, payload: value })

let defaultState = {
  phrases: null, // null => loading, [] => 0 results
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
