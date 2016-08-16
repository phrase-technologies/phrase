import { push } from 'react-router-redux'

import {
  login as loginHelper,
  signup as signupHelper,
  forgotPassword as forgotPasswordHelper,
  newPassword as newPasswordHelper,
  confirmUser as confirmUserHelper,
  retryConfirmUser as retryConfirmUserHelper,
} from 'helpers/authHelpers'
import { api } from 'helpers/ajaxHelpers'
import { modal, auth, phrase } from '../actions/actions'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave } from 'reducers/reducePhrase'
import { modalOpen } from 'reducers/reduceModal.js'
import { catchAndToastException } from 'reducers/reduceNotification'
import { tryAnalyticsEvent } from 'helpers/tryAnalytics'

function handleLogin({ dispatch, getState, response }) {
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
              tryAnalyticsEvent({ eventName: "Logged In" })
              handleLogin({ dispatch, getState, response })
            }
            else dispatch({
              type: auth.LOGIN_FAIL,
              payload: { message: response.message, confirmFail: response.confirmFail },
            })
          }
        })
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let signup = ({ inviteCode, email, username, password }) => {
  return (dispatch) => {
    dispatch({ type: auth.LOGIN_REQUEST })

    catchAndToastException({ dispatch,
      toCatch: async () => {
        await signupHelper({
          body: { inviteCode, email, username, password },
          callback: (response) => {
            if (response.success)
              dispatch(modalOpen({
                modalComponent: `SignupConfirmationModal`,
                payload: email,
              }))
            else
              dispatch({
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

    catchAndToastException({ dispatch,
      toCatch: async() => {
        await forgotPasswordHelper({ email }, response => {
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
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let newPassword = ({ email, resetToken, password, confirmPassword }) => {
  return (dispatch) => {
    dispatch({ type: auth.LOGIN_REQUEST})

    catchAndToastException({ dispatch,
      toCatch: async () => {
        await newPasswordHelper({ email, resetToken, password, confirmPassword }, response => {
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
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let confirmUser = ({ email, confirmToken }) => {
  return (dispatch) => {
    catchAndToastException({ dispatch,
      toCatch: async () => {
        await confirmUserHelper({ email, confirmToken }, async response => {
          if (response.success) {
            tryAnalyticsEvent({ eventName: "Signed Up" })
            dispatch({
              type: auth.LOGIN_SUCCESS,
              payload: {
                loggedIn: response.success,
                user: response.user,
              },
            })
            dispatch(push('/phrase/new'))
            dispatch(modalOpen({ modalComponent: 'ConfirmSuccessModal' }))
          }
          else dispatch({ type: auth.USER_CONFIRM_FAIL })
        })
      },
    })
  }
}

export let manualConfirmUser = ({ email, confirmToken }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST })
    catchAndToastException({ dispatch,
      toCatch: async() => {
        await confirmUserHelper({ email, confirmToken }, async response => {
          if (response.success) {
            tryAnalyticsEvent({ eventName: "Signed Up" })
            handleLogin({ dispatch, getState, response })
            dispatch(modalOpen({ modalComponent: 'ConfirmSuccessModal' }))
          }
          else dispatch({
            type: auth.LOGIN_FAIL,
            payload: { message: response.message },
          })
        })
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
    })
  }
}

export let retryConfirmUser = ({ email }) => {
  return (dispatch) => {
    dispatch({ type: auth.LOGIN_REQUEST})
    catchAndToastException({ dispatch,
      toCatch: async () => {
        await retryConfirmUserHelper({ email }, async response => {
          if (response.success) dispatch(
            modalOpen({
              modalComponent: `SignupConfirmationModal`,
              payload: email,
            }))
          else dispatch({
            type: auth.LOGIN_FAIL,
            payload: { message: response.message },
          })
        })
      },
      callback: () => { dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}) },
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
  showConfirmUserError: false,
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
          confirmFail: false,
        }
      }
      else if (['ForgotPasswordSuccessModal', 'SignupConfirmationModal', 'ConfirmRetryModal'].find(x => x === action.modalComponent)) {
        return {
          ...state,
          errorMessage: null,
          email: action.payload,
          requestingAuth: false,
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
        confirmFail: action.payload.confirmFail,
        requestingAuth: false,
      }

    // ------------------------------------------------------------------------
    case auth.USER_CONFIRM_FAIL:
      return {
        ...state,
        showConfirmUserError: true,
      }

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
