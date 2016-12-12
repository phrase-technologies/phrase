import u from 'updeep'
import { modal, auth, phrase } from '../actions/actions.js'

// ============================================================================
// Modal Action Creators
// ============================================================================
export let modalOpen = ({ modalComponent, payload }) => {
  return (dispatch) => {
    dispatch({ type: modal.CLOSE })
    setTimeout(() => {
      dispatch({
        type: modal.OPEN,
        modalComponent,
        payload
      })
    }, 10)
  }
}
export let modalClose = () => ({ type: modal.CLOSE })

// ============================================================================
// Modal Reducer
// ============================================================================
let defaultState = {
  show: false,
  activeModal: null,
}

export default function reduceModals(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case modal.OPEN:
      return u({
        show: true,
        activeModal: action.modalComponent,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.UPDATE_RACK:
    case modal.CLOSE:
    case auth.LOGIN_SUCCESS: // Close modals after successful login
      return u({
        show: false,
        activeModal: null,
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
