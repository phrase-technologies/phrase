// ============================================================================
// Layout Navigation
// ============================================================================

import { LAYOUT_CONSOLE_TOGGLE,
         LAYOUT_CONSOLE_SPLIT } from '../actions/actions.js';

let defaultState = {
  console: true,
  consoleSplit: 0.500
};

export default function navigation(state = defaultState, action) {
  switch (action.type)
  {
    case LAYOUT_CONSOLE_TOGGLE:
      return Object.assign({}, state, {console: !state.console});

    case LAYOUT_CONSOLE_SPLIT:
      var stateChanges = {};
      stateChanges.consoleSplit = action.ratio < 0.0 ? null : action.ratio;
      stateChanges.consoleSplit = action.ratio > 1.0 ? null : stateChanges.consoleSplit;
      return Object.assign({}, state, stateChanges);

    default:
      return state;
  }
}

