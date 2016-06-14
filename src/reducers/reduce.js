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
import reducePianoroll from './reducePianoroll'
import reduceCursor from './reduceCursor'
import reduceAuth from './reduceAuth'
import reduceArrangeTool from './reduceArrangeTool'

import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import undoable, { excludeAction, combineFilters } from 'redux-undo'
import { phrase } from 'actions/actions'

let excludeIgnored = action => !action.ignore
let undoOptions = { filter: combineFilters(excludeAction(phrase.LOAD), excludeIgnored) }

let baseReducers = {
  phrase: undoable(reducePhrase, undoOptions),
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
  cursor: reduceCursor,
  auth: reduceAuth,
  arrangeTool: reduceArrangeTool,
}

export let testReducer = combineReducers(baseReducers)
let finalReducer = combineReducers(reducerSpec)

export default finalReducer
