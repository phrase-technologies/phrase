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

import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import undoable, { excludeAction } from 'redux-undo'
import { phrase } from 'actions/actions'

import { REHYDRATE } from 'redux-persist/constants'

function rehydratePhrase (reducer) {
  return (state, action) => {
    switch (action.type) {
      case REHYDRATE:
        return action.payload.phrase
          ? { ...action.payload.phrase }
          : reducer(state, action)

      case phrase.LOAD:
        return {
          ...action.payload.state
        }

      default:
        return reducer(state, action)
    }
  }
}

function rehydratePhraseMeta (reducer) {
  return (state, action) => {
    switch (action.type) {
      case REHYDRATE:
        return action.payload.phraseMeta
          ? { ...action.payload.phraseMeta }
          : reducer(state, action)

      default:
        return reducer(state, action)
    }
  }
}

let finalReducer = combineReducers({
  routing: routerReducer,
  modal: reduceModal,
  navigation: reduceNavigation,
  transport: reduceTransport,
  phrase: rehydratePhrase(undoable(reducePhrase, { filter: excludeAction(phrase.LOAD) })),
  phraseMeta: rehydratePhraseMeta(reducePhraseMeta),
  library: reduceLibrary,
  mixer: reduceMixer,
  pianoroll: reducePianoroll,
  cursor: reduceCursor,
  auth: reduceAuth,
})
export default finalReducer
