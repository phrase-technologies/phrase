// ============================================================================
// Layout Navigation
// ============================================================================

import u from 'updeep'

import { layout, pianoroll, phrase } from '../actions/actions.js'

let defaultState = {
  consoleEmbedded: false,
  consoleSplitRatio: null
}

export default function reducerNavigation(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case layout.CONSOLE_EMBED:
      return u({
        consoleEmbedded: !state.consoleEmbedded
      }, state)

    // ------------------------------------------------------------------------
    case layout.CONSOLE_SPLIT:
      let stateChanges = {}
      stateChanges.consoleSplitRatio = action.ratio < 0.0 ? null : action.ratio
      stateChanges.consoleSplitRatio = action.ratio > 1.0 ? null : stateChanges.consoleSplitRatio
      return u(stateChanges, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      // Watch for current track deletion!
      let { selectionType, trackSelectionID } = action.payload
      if (selectionType === "tracks" && trackSelectionID === action.payload.currentTrack) {
        return u({
          consoleEmbedded: false,
          consoleSplitRatio: null,
        }, state)
      }
      return state

    // ------------------------------------------------------------------------
    case phrase.SELECT_TRACK:
    case pianoroll.SET_FOCUS_WINDOW:
      return u({
        consoleSplitRatio: state.consoleSplitRatio ? state.consoleSplitRatio : 0.500
      }, state)

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE:
    case phrase.LOAD_START:
      return defaultState

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
