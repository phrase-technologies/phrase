// ============================================================================
// Modal Dialogs
// ============================================================================
import { modal } from '../actions/actions.js'

import u from 'updeep'

let defaultState = {
  activeModal: null
}

export default function reduceModals(state = defaultState, action) {
  switch (action.type) {
    // ------------------------------------------------------------------------
    case modal.OPEN:
      return u({
        activeModal: action.modalComponent
      }, state)

    // ------------------------------------------------------------------------
    case modal.CLOSE:
      return u({
        activeModal: null
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state

  }
}
