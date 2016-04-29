// ============================================================================
// Combine Reducer Branches
// ============================================================================
// We use combineReducers to organize state into decoupled branches, where each
// branch represents a different module within the app. Much cleaner this way.
// Thanks, Dan Abramov!
//
// #nowplaying: https://soundcloud.com/mitis/mitis-forever-club-mix

import reduceModal from './reduceModal.js'
import reduceNavigation from './reduceNavigation.js'
import reduceTransport from './reduceTransport.js'
import reducePhrase from './reducePhrase.js'
import reduceSelection from './reduceSelection.js'
import reduceMixer from './reduceMixer.js'
import reducePianoroll from './reducePianoroll.js'
import reduceCursor from './reduceCursor.js'
import reduceAuth from './reduceAuth'

import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import undoable from 'redux-undo'

let finalReducer = combineReducers({
  routing: routerReducer,
  modal: reduceModal,
  navigation: reduceNavigation,
  transport: reduceTransport,
  phrase: undoable(reducePhrase),
  selection: reduceSelection,
  mixer: reduceMixer,
  pianoroll: reducePianoroll,
  cursor: reduceCursor,
  auth: reduceAuth,
})
export default finalReducer
