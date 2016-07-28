import u from 'updeep'
import { notification } from 'actions/actions'

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

export let addAPIErrorNotification = () => {
  return addNotification({
    title: `Connection failure`,
    message: `please make sure you're still connected to the internet`,
  })
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
