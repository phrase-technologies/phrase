// ============================================================================
// Layout Navigation
// ============================================================================

import { LAYOUT_CONSOLE_EMBED,
         LAYOUT_CONSOLE_SPLIT } from '../actions/actions.js';

let defaultState = {
  consoleEmbedded: false,
  consoleSplitRatio: 0.500
};

export default function navigation(state = defaultState, action) {
  switch (action.type)
  {
    case LAYOUT_CONSOLE_EMBED:
      return Object.assign({}, state, {consoleEmbedded: !state.consoleEmbedded});

    case LAYOUT_CONSOLE_SPLIT:
      var stateChanges = {};
      stateChanges.consoleSplitRatio = action.ratio < 0.0 ? null : action.ratio;
      stateChanges.consoleSplitRatio = action.ratio > 1.0 ? null : stateChanges.consoleSplitRatio;
      return Object.assign({}, state, stateChanges);

    default:
      return state;
  }
}

