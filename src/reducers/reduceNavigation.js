import u from 'updeep'

import { layout, pianoroll, phrase } from '../actions/actions.js'

// ============================================================================
// Layout Navigation Action Creators
// ============================================================================
export const layoutConsoleEmbedded = () => ({type: layout.CONSOLE_EMBED})
export const layoutConsoleSplit = (ratio) => ({type: layout.CONSOLE_SPLIT, ratio})

// ============================================================================
// Layout Navigation Reducer
// ============================================================================
let defaultState = {
  consoleEmbedded: false,
  consoleSplitRatio: 0.0,
  rackOpen: false,
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
      stateChanges.consoleSplitRatio = Math.min(1.0, Math.max(action.ratio, 0.0))
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
      let newConsoleSplitRatio = state.consoleSplitRatio
      if (!state.consoleSplitRatio || state.consoleSplitRatio > 0.8)
        newConsoleSplitRatio = 0.500

      return u({
        consoleSplitRatio: newConsoleSplitRatio
      }, state)

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE:
    case phrase.LOAD_START:
      return defaultState

    // ------------------------------------------------------------------------

    case layout.TOGGLE_RACK:
      return {
        ...state,
        rackOpen: !state.rackOpen
      }

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
