import u from 'updeep'
import { userProfile } from 'actions/actions'
import { api } from 'helpers/ajaxHelpers'
import { catchAndToastException } from 'reducers/reduceNotification'

// ============================================================================
// User Profiles Action Creators
// ============================================================================
export const userRequestProfileIfNotExisting = ({ userId }) => {
  return (dispatch, getState) => {
    let state = getState()
    let { users } = state.userProfile
    if (!users[userId])
      dispatch(userRequestProfile({ userId }))
  }
}

export const userRequestProfile = ({ userId }) => {
  return (dispatch) => {
    dispatch({ type: userProfile.REQUEST_USER, payload: { id: userId } })

    catchAndToastException({ dispatch, toCatch: async () => {
      let { loadedUser } = await api({ endpoint: `loadUser`, body: { theUserId: userId } })
      dispatch({ type: userProfile.RECEIVE_USER, payload: loadedUser })
    }})
  }
}

// ============================================================================
// User Profiles
// ============================================================================
export const defaultState = {
  users: {},
}

export default function reduceUserProfile(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case userProfile.REQUEST_USER: {
      let userId = action.payload.id
      return u({
        users: {
          [userId]: {
            id: userId,
            pending: true,
          },
        },
      }, state)
    }

    // ------------------------------------------------------------------------
    case userProfile.RECEIVE_USER: {
      let userId = action.payload.id
      let newState = u({
        users: {
          [userId]: {
            ...action.payload,
            pending: false,
          },
        },
      }, state)
      return newState
    }
    // ------------------------------------------------------------------------
    default:
      return state
  }
}
