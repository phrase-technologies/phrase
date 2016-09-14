import u from 'updeep'
import { push } from 'react-router-redux'

import {
  login as loginHelper,
  signup as signupHelper,
  forgotPassword as forgotPasswordHelper,
  newPassword as newPasswordHelper,
  confirmUser as confirmUserHelper,
  retryConfirmUser as retryConfirmUserHelper,
  oAuthLogin as oAuthLoginHelper,
} from 'helpers/authHelpers'
import { modal, auth } from '../actions/actions'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { phraseSave } from 'reducers/reducePhrase'
import { modalOpen } from 'reducers/reduceModal.js'
import { addNotification, catchAndToastException } from 'reducers/reduceNotification'
import { tryAnalyticsEvent } from 'helpers/tryAnalytics'

let handleLogin = ({ dispatch, getState, response }) => {
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
      callback: () => dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}),
    })
  }
}

export let signup = ({ inviteCode, email, username, password, oAuthToken }) => {
  return (dispatch) => {
    dispatch({ type: auth.LOGIN_REQUEST })
    catchAndToastException({ dispatch,
      toCatch: async () => {
        await signupHelper({
          body: { inviteCode, email, username, password, oAuthToken },
          callback: (response) => {
            if (response.success) {
              if (oAuthToken) {
                dispatch(oAuthLogin({ email, token: oAuthToken }))
              }
              else {
                dispatch(login({ email, password }))
                dispatch(addNotification({
                  title: `You have been sent a confirmation email`,
                  message: `Please confirm`,
                }))
              }
            }
            else dispatch({
              type: auth.LOGIN_FAIL,
              payload: { message: response.message },
            })
          }
        })
      },
      callback: () => dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}),
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
      callback: () => dispatch({ type: auth.LOGIN_FAIL, payload: { message: `` }}),
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
            dispatch(push(`/phrase/new`))
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
      callback: () => dispatch({ type: auth.USER_CONFIRM_FAIL }),
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

export let makeOAuthRequest = ({ oAuth }) => {
  return (dispatch) => {
    dispatch({ type: auth.OAUTH_REQUEST, oAuth})

    // Bind dispatch and oAuthCallback to the parent window, so that the client window has access
    window.dispatch = dispatch
    window.oAuthCallback = oAuthCallback
    let newWindow = window.open(
      `${API_URL}/auth/${oAuth.toLowerCase()}`,
      `Login with ${oAuth}`,
      `height=500,width=500`
    )
    newWindow.focus()
  }
}

let oAuthCallback = ({ success, token, email, newUser }) => {
  return (dispatch, getState) => {
    let state = getState()
    success = success === `true`
    newUser = newUser === `true`

    if (!success)
      dispatch({
        type: auth.LOGIN_FAIL,
        payload: { message: { oAuthError: `${state.auth.oAuth} authentication failed, please try again`, }}
      })
    else {
      if (newUser) {
        if (state.modal.activeModal !== `SignupModal`)
          dispatch(modalOpen({ modalComponent: `SignupModal` }))
        dispatch({
          type: auth.OAUTH_SUCCESS,
          oAuthMessage: `${state.auth.oAuth} authentication successful, please choose a username below to finish signing up`,
          oAuthToken: token,
          oAuthEmail: email,
        })
      }
      else dispatch(oAuthLogin({ token, email }))
    }
  }
}

export let oAuthLogin = ({ email, token }) => {
  return (dispatch, getState) => {
    dispatch({ type: auth.LOGIN_REQUEST})
    catchAndToastException({ dispatch,
      toCatch: async () => {
        await oAuthLoginHelper({
          body: { email, token },
          callback: async response => {
            if (response.success) {
              tryAnalyticsEvent({ eventName: "Logged In" })
              handleLogin({ dispatch, getState, response })
            }
            else dispatch({
              type: auth.LOGIN_FAIL,
              payload: { message: response.message },
            })
          }
      })},
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
  oAuth: null,
  oAuthMessage: null,
  oAuthToken: null,
  oAuthEmail: null,
}

export default (state = intialState, action) => {

  switch (action.type) {
    // ------------------------------------------------------------------------
    // Clear out old auth error messages before launching auth modals
    case modal.OPEN:
      if (['LoginModal', 'SignupModal', 'ForgotPasswordModal'].find(x => x === action.modalComponent)) {
        return u({
          errorMessage: null,
          confirmFail: false,
        }, state)
      }
      else if (['ForgotPasswordSuccessModal', 'SignupConfirmationModal', 'ConfirmRetryModal'].find(x => x === action.modalComponent)) {
        return u({
          errorMessage: null,
          email: action.payload,
          requestingAuth: false,
        }, state)
      }
      return state

    case modal.CLOSE:
      return u({
        errorMessage: null,
      }, state)

    // ------------------------------------------------------------------------
    case auth.LOGIN_REQUEST:
      return u({
        requestingAuth: true,
        errorMessage: null,
      }, state)

    // ------------------------------------------------------------------------
    case auth.LOGIN_SUCCESS:
      return u({
        loggedIn: action.payload.loggedIn,
        user: action.payload.user,
        requestingAuth: false,
        errorMessage: null,
      }, state)

    // ------------------------------------------------------------------------
    case auth.LOGOUT:
      return {
        loggedIn: false,
        user: {},
        errorMessage: null,
      }

    // ------------------------------------------------------------------------
    case auth.LOGIN_FAIL:
      return u({
        errorMessage: action.payload.message,
        confirmFail: action.payload.confirmFail,
        requestingAuth: false,
      }, state)

    // ------------------------------------------------------------------------
    case auth.USER_CONFIRM_FAIL:
      return u({
        showConfirmUserError: true,
      }, state)

    // ------------------------------------------------------------------------
    case auth.OAUTH_REQUEST:
      return u({
        requestingAuth: true,
        errorMessage: null,
        oAuth: action.oAuth,
      }, state)

    // ------------------------------------------------------------------------
    case auth.OAUTH_SUCCESS:
      return u({
        oAuthMessage: action.oAuthMessage,
        oAuthToken: action.oAuthToken,
        oAuthEmail: action.oAuthEmail,
        requestingAuth: false,
        errorMessage: null,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
