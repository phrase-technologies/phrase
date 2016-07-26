import { login as loginHelper, signup as signupHelper } from 'helpers/authHelpers'
import { modal } from '../actions/actions.js'
import { auth } from '../actions/actions.js'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave } from 'reducers/reducePhrase'
import { addAPIErrorNotification } from 'reducers/reduceNotification'

// ============================================================================
// Authentication Action Creators
// ============================================================================
export let login = ({ email, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    loginHelper({ email, password },
      response => {
        if (response.success) {
          dispatch({
            type: auth.LOGIN_SUCCESS,
            payload: {
              loggedIn: response.success,
              user: response.user,
            },
          })

          let { phraseId: existingPhrase, pristine } = getState().phraseMeta
          if (!pristine) {
            if (existingPhrase)
              dispatch(phraseSave())
            else
              dispatch(librarySaveNew())
          }
        }
        else dispatch({
          type: auth.LOGIN_FAIL,
          payload: { message: response.message },
        })
      },
      () => {
        dispatch(addAPIErrorNotification())
        dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }})
      }
    )
  }
}

export let signup = ({ email, username, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    signupHelper({ email, username, password },
      response => {
        if (response.success) {
          dispatch({
            type: auth.LOGIN_SUCCESS,
            payload: {
              loggedIn: response.success,
              user: response.user,
            },
          })

          let phraseState = getState().phrase
          if (phraseState.past.length || phraseState.future.length) {
            dispatch(librarySaveNew())
          }
        }
        else dispatch({
          type: auth.LOGIN_FAIL,
          payload: { message: response.message },
        })
      },
      () => {
        dispatch(addAPIErrorNotification({ title: `API Error`, message: `Please try again` }))
        dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }})
      }
    )
  }
}

export let logout = () => {
  return (dispatch) => {
    localStorage.clear()

    setTimeout(() => {
      dispatch({
        type: auth.LOGOUT,
        payload: { loggedIn: false },
      })
    }, 250)
  }
}

// ============================================================================
// Authentication Reducer
// ============================================================================

let intialState = {
  loggedIn: !!localStorage.token,
  requestingAuth: false,
  user: {
    id: localStorage.id,
    email: localStorage.email,
    password: localStorage.password,
    username: localStorage.username,
  },
  errorMessage: null,
}

export default (state = intialState, action) => {

  switch (action.type) {
    // ------------------------------------------------------------------------
    // Clear out old auth error messages before launching auth modals
    case modal.OPEN:
      if (['LoginModal', 'SignupModal'].find(x => x === action.modalComponent)) {
        return {
          ...state,
          errorMessage: null,
        }
      }
      return state

    // ------------------------------------------------------------------------
    case auth.LOGIN_REQUEST:
      return {
        ...state,
        requestingAuth: true,
        errorMessage: null,
      }

    // ------------------------------------------------------------------------
    case auth.LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: action.payload.loggedIn,
        user: action.payload.user,
        requestingAuth: false,
        errorMessage: null,
      }

    // ------------------------------------------------------------------------
    case auth.LOGOUT:
      return {
        loggedIn: false,
        user: {},
        errorMessage: null,
      }

    // ------------------------------------------------------------------------
    case auth.LOGIN_FAIL:
      return {
        ...state,
        errorMessage: action.payload.message,
        requestingAuth: false,
      }

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
