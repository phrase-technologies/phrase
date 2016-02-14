// ============================================================================
// Layout Navigation
// ============================================================================

import u from 'updeep';

import { layout, pianoroll } from '../actions/actions.js';

let defaultState = {
  consoleEmbedded: false,
  consoleSplitRatio: null
};

export default function reducerNavigation(state = defaultState, action) {
  switch (action.type)
  {
    case layout.CONSOLE_EMBED:
      return Object.assign({}, state, {consoleEmbedded: !state.consoleEmbedded});

    case layout.CONSOLE_SPLIT:
      var stateChanges = {};
      stateChanges.consoleSplitRatio = action.ratio < 0.0 ? null : action.ratio;
      stateChanges.consoleSplitRatio = action.ratio > 1.0 ? null : stateChanges.consoleSplitRatio;
      return Object.assign({}, state, stateChanges);

    case pianoroll.SET_FOCUS_WINDOW:
      return u({
        consoleSplitRatio: state.consoleSplitRatio ? state.consoleSplitRatio : 0.500 
      }, state)

    default:
      return state;
  }
}

