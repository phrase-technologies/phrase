import u from 'updeep'
import { notification } from 'actions/actions'
import { modalOpen } from 'reducers/reduceModal'
import { logout } from 'reducers/reduceAuth'

// ============================================================================
// Notification Action Creators
// ============================================================================

export let addNotification = ({ title, message }) => {
  return (dispatch) => {
    let key = Date.now()
    dispatch({
      type: notification.ADD,
      payload: {
        newNotification: {
          title,
          message,
          key,
          action: 'Close',
          dismissAfter: 5000,
          onClick: () => { dispatch(dismissNotification({ key })) }
        }
      }
    })
  }
}

export const catchAndToastException = async ({ dispatch, toCatch, callback }) => {
  try {
    await toCatch()
  }
  catch(e) {
    if(e.statusText) {
      switch(e.status) {
        case 403: // Invalid token / unauthorized errors
          dispatch(addNotification({
            title: `Token expired`,
            message: `Please log back in to continue making awesome music!`,
          }))
          dispatch(modalOpen({ modalComponent: 'LoginModal' }))
          dispatch(logout())
          break
        default: // Other fetch errors
          dispatch(addNotification({
            title: e.status.toString(),
            message: e.statusText,
          }))
      }
    }
    else // Non fetch errors
      dispatch(addNotification({
        title: `System Error`,
        message: `Please try again later`,
      }))
    if (callback) callback()
  }
}

export let dismissNotification = ({ key }) => {
  return (dispatch) => {
    dispatch({
      type: notification.DISMISS,
      payload: { key }
    })
  }
}

// ============================================================================
// Notification Reducer
// ============================================================================
let defaultState = {
  notifications: [],
}

export default function reduceNotification(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case notification.ADD:
      return u({
        notifications: [ ...state.notifications, action.payload.newNotification ]
      }, state)

    // ------------------------------------------------------------------------
    case notification.DISMISS:
      return u({
        notifications: state.notifications.filter((notif) => { return notif.key !== action.payload.key })
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
