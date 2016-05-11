import { login as loginHelper, signup as signupHelper } from 'helpers/authHelpers'
import { modal } from '../actions/actions.js'
import { auth } from '../actions/actions.js'
import { librarySave } from 'reducers/reduceLibrary'

// ============================================================================
// Authentication Action Creators
// ============================================================================
export let login = ({ email, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    loginHelper({ email, password }, response => {
      if (response.success) {
        dispatch({
          type: auth.LOGIN_SUCCESS,
          payload: {
            loggedIn: response.success,
            user: response.user,
          },
        })

        if (getState().phrase.past.length) {
          dispatch(librarySave())
        }
      }

      else dispatch({
        type: auth.LOGIN_FAIL,
        payload: { message: response.message },
      })
    })
  }
}

export let signup = ({ email, username, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    signupHelper({ email, username, password }, response => {
      if (response.success) {
        dispatch({
          type: auth.LOGIN_SUCCESS,
          payload: {
            loggedIn: response.success,
            user: response.user,
          },
        })

        if (getState().phrase.past.length) {
          dispatch(librarySave())
        }
      }

      else dispatch({
        type: auth.LOGIN_FAIL,
        payload: { message: response.message },
      })
    })
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
  user: { email: localStorage.email },
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
