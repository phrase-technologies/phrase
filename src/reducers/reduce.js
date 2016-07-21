// ============================================================================
// Combine Reducer Branches
// ============================================================================
// We use combineReducers to organize state into decoupled branches, where each
// branch represents a different module within the app. Much cleaner this way.
// Thanks, Dan Abramov!
//
// #nowplaying: https://soundcloud.com/mitis/mitis-forever-club-mix

import reduceModal from './reduceModal'
import reduceNavigation from './reduceNavigation'
import reduceTransport from './reduceTransport'
import reducePhrase from './reducePhrase'
import reducePhraseMeta from './reducePhraseMeta'
import reduceLibrary from './reduceLibrary'
import reduceMixer from './reduceMixer'
import reduceMouse from './reduceMouse'
import reducePianoroll from './reducePianoroll'
import reduceCursor from './reduceCursor'
import reduceAuth from './reduceAuth'
import reduceArrangeTool from './reduceArrangeTool'
import reduceNotification from './reduceNotification'
import reduceMIDI from './reduceMIDI'

import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import undoable, { excludeAction, combineFilters } from 'redux-undo'
import { phrase } from 'actions/actions'

function rehydratePhrase (reducer) {
  return (state, action) => {
    switch (action.type) {
      case phrase.LOAD_FINISH:  // Can't do this in the reducePhrase branch,
        return {                // payload.state encapsulates undo history
          ...action.payload.state
        }

      default:
        return reducer(state, action)
    }
  }
}

let excludeIgnored = action => !action.ignore
let undoOptions = { filter: combineFilters(excludeAction(phrase.LOAD), excludeIgnored) }

let baseReducers = {
  phrase: rehydratePhrase(undoable(reducePhrase, undoOptions)),
  phraseMeta: reducePhraseMeta,
  pianoroll: reducePianoroll,
}

let reducerSpec = {
  ...baseReducers,
  routing: routerReducer,
  modal: reduceModal,
  navigation: reduceNavigation,
  transport: reduceTransport,
  library: reduceLibrary,
  mixer: reduceMixer,
  mouse: reduceMouse,
  cursor: reduceCursor,
  auth: reduceAuth,
  arrangeTool: reduceArrangeTool,
  notification: reduceNotification,
  midi: reduceMIDI,
}

export let testReducer = combineReducers(baseReducers)
let finalReducer = combineReducers(reducerSpec)

export default finalReducer
