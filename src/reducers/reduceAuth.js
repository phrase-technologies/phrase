import { login as loginHelper, signup as signupHelper } from 'helpers/authHelpers'
import isAValidEmail from 'helpers/isEmail'

export let AUTH_REQUEST = `LOGIN_REQUEST`
export let LOGIN_SUCCESS = `LOGIN_SUCCESS`
export let LOGIN_FAIL = `LOGIN_FAIL`
export let LOGOUT = `LOGOUT`

export let login = ({ email, password }) => {
  return (dispatch) => {
    dispatch({ type: AUTH_REQUEST })

    loginHelper({ email, password }, response => {
      if (response.success) {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            loggedIn: response.success,
            user: response.user,
          },
        })
      }

      else dispatch({
        type: LOGIN_FAIL,
        payload: { message: response.message },
      })
    })
  }
}

export let signup = ({ email, password }) => {
  return (dispatch) => {
    dispatch({ type: AUTH_REQUEST })

    if (!isAValidEmail(email)) {
      dispatch({
        type: LOGIN_FAIL,
        payload: { message: `Invalid email.` },
      })

      return
    }

    signupHelper({ email, password }, response => {
      if (response.success) {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            loggedIn: response.success,
            user: response.user,
          },
        })
      }

      else dispatch({
        type: LOGIN_FAIL,
        payload: { message: response.message },
      })
    })
  }
}

export let logout = () =>
  dispatch => {
    localStorage.clear()

    dispatch({
      type: LOGOUT,
      payload: { loggedIn: false },
    })
  }

/*----------------------------------------------------------------------------*/

let intialState = {
  loggedIn: !!localStorage.token,
  requestingAuth: false,
  user: { email: localStorage.email },
  errorMessage: null,
}

export default (state = intialState, action) => {

  switch (action.type) {

    case AUTH_REQUEST:
      return {
        ...state,
        requestingAuth: true,
        errorMessage: null,
      }

    case LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: action.payload.loggedIn,
        user: action.payload.user,
        requestingAuth: false,
        errorMessage: null,
      }

    case LOGOUT:
      return {
        loggedIn: false,
        errorMessage: null,
      }

    case LOGIN_FAIL:
      return {
        ...state,
        errorMessage: action.payload.message,
        requestingAuth: false,
      }

    default:
      return state
  }
}
