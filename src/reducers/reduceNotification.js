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

export let addAPIErrorNotification = () => {
  return addNotification({
    title: `Connection failure`,
    message: `Please make sure you're still connected to the internet`,
  })
}

export let addForbiddenErrorNotification = () => {
  return addNotification({
    title: `Token expired`,
    message: `Please log back in to continue making awesome music!`,
  })
}

export const catchAndToastException = async ({ dispatch, toCatch, callback }) => {
  try {
    await toCatch()
    if (callback) callback()
  }
  catch(e) {
    if (e === 403) {
      dispatch(addForbiddenErrorNotification())
      dispatch(modalOpen({ modalComponent: 'LoginModal' }))
      dispatch(logout())
    } else dispatch(addNotification({ title: "API Error", message: e.message }))
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
