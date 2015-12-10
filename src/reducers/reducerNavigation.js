// ============================================================================
// Layout Navigation
// ============================================================================

import { NAV_CONSOLE_TOGGLE } from '../actions/actions.js';

let defaultState = {
  console: true
};

export default function navigation(state = defaultState, action) {
  switch (action.type)
  {
    case NAV_CONSOLE_TOGGLE:
      return Object.assign({}, state, {console: !state.console});
    default:
      return state;
  }
}

