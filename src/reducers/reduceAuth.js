import { push } from 'react-router-redux'

import { login as loginHelper, signup as signupHelper, forgotPassword as forgotPasswordHelper, newPassword as newPasswordHelper } from 'helpers/authHelpers'
import { modal } from '../actions/actions.js'
import { auth } from '../actions/actions.js'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave } from 'reducers/reducePhrase'
import { modalOpen } from 'reducers/reduceModal.js'
import { catchAndToastException } from 'reducers/reduceNotification'

// ============================================================================
// Authentication Action Creators
// ============================================================================
export let login = ({ email, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    catchAndToastException({ dispatch,
      toCatch: async () => {
        await loginHelper({
          body: { email, password },
          callback: (response) => {
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
          }
        })
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let signup = ({ email, username, password }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    catchAndToastException({ dispatch,
      toCatch: async () => {
        await signupHelper({
          body: { email, username, password },
          callback: (response) => {
            if (response.success) {
              dispatch({
                type: auth.LOGIN_SUCCESS,
                payload: {
                  loggedIn: response.success,
                  user: response.user,
                },
              })
              dispatch(modalOpen({ modalComponent: `SignupConfirmationModal`, payload: email }))

              let phraseState = getState().phrase
              if (phraseState.past.length || phraseState.future.length) {
                dispatch(librarySaveNew())
              }
            }
            else dispatch({
              type: auth.LOGIN_FAIL,
              payload: { message: response.message },
            })
          }
        })
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let forgotPassword = ({ email }) => {
  return (dispatch) => {
    dispatch({ type: auth.LOGIN_REQUEST})

    forgotPasswordHelper({ email }, response => {
      if (response.success)
        dispatch(modalOpen({
          modalComponent: 'ForgotPasswordSuccessModal',
          payload: email,
      }))
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
  return (dispatch) => {
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

        dispatch(push(`/`))
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
}

export default (state = intialState, action) => {

  switch (action.type) {
    // ------------------------------------------------------------------------
    // Clear out old auth error messages before launching auth modals
    case modal.OPEN:
      if (['LoginModal', 'SignupModal', 'ForgotPasswordModal'].find(x => x === action.modalComponent)) {
        return {
          ...state,
          errorMessage: null,
        }
      }
      else if (['ForgotPasswordSuccessModal', 'SignupConfirmationModal'].find(x => x === action.modalComponent)) {
        return {
          ...state,
          email: action.payload,
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
