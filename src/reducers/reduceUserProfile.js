import u from 'updeep'
import { userProfile } from 'actions/actions'
import {
  uAppend,
  uReplace,
} from 'helpers/arrayHelpers'
import { api } from 'helpers/ajaxHelpers'
import { catchAndToastException } from 'reducers/reduceNotification'

// ============================================================================
// User Profiles Action Creators
// ============================================================================
export const userRequestProfile = ({ userId }) => {
  return (dispatch) => {
    dispatch({ type: userProfile.REQUEST_USER, payload: { id: userId } })

    catchAndToastException({ dispatch, toCatch: async () => {
      let { loadedUser } = await api({ endpoint: `loadUser`, body: { userId } })
      dispatch({ type: userProfile.RECEIVE_USER, payload: loadedUser })
    }})
  }
}

// ============================================================================
// User Profiles
// ============================================================================
export const defaultState = {
  users: [],
}

export default function reduceUserProfile(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case userProfile.REQUEST_USER: {
      let existingUser = state.users.find(user => {
        return user.id === action.payload.id
      })

      // Requesting update of existing user
      if (existingUser) {
        let pendingUser = u({
          pending: true,
        }, existingUser)
        return u({
          users: uReplace(existingUser, pendingUser)
        }, state)
      }

      // Requesting new user
      return u({
        users: uAppend({
          id: action.payload.id,
          pending: true,
        })
      }, state)
    }
    // ------------------------------------------------------------------------
    case userProfile.RECEIVE_USER: {
      let existingUser = state.users.find(user => {
        return user.id === action.payload.id
      })

      return u({
        users: uReplace(existingUser, action.payload)
      }, state)
    }
    // ------------------------------------------------------------------------
    default:
      return state
  }
}
