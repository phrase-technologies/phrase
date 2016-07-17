import { login as loginHelper, signup as signupHelper, forgotPassword as forgotPasswordHelper, newPassword as newPasswordHelper } from 'helpers/authHelpers'
import { modal } from '../actions/actions.js'
import { auth } from '../actions/actions.js'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave } from 'reducers/reducePhrase'
import { modalOpen } from 'reducers/reduceModal.js'

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

        let phraseState = getState().phrase
        if (phraseState.past.length || phraseState.future.length) {
          dispatch(librarySaveNew())
        }
      }

      else dispatch({
        type: auth.LOGIN_FAIL,
        payload: { message: response.message },
      })
    })
  }
}

export let forgotPassword = ({ email }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST})

    forgotPasswordHelper({ email }, response => {
      if (response.success)
        dispatch(modalOpen({ modalComponent: 'LoginModal'  }))
      else {
        dispatch({
          type: auth.LOGIN_FAIL,
          payload: { message: response.message },
        })
      }
    })
  }
}

export let newPassword = ({ email, resetToken, password, confirmPassword }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST})

    newPasswordHelper({ email, resetToken, password, confirmPassword }, response => {
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
      else {
        dispatch({
          type: auth.LOGIN_FAIL,
          payload: { message: response.message },
        })
      }
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
  user: {
    id: localStorage.id,
    email: localStorage.email,
    password: localStorage.password,
    username: localStorage.username,
  },
  errorMessage: null,
  resetToken: null
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
      else if (action.modalComponent == 'NewPasswordModal') {
        return {
          ...state,
          resetToken: action.payload.resetToken,
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
