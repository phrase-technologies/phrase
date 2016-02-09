// ============================================================================
// Combine Reducer Branches
// ============================================================================
// We use combineReducers to organize state into decoupled branches, where each
// branch represents a different module within the app. Much cleaner this way.
import reduceNavigation from './reduceNavigation.js'
import reduceTransport from './reduceTransport.js'
import reducePhrase from './reducePhrase.js'
import reduceMixer from './reduceMixer.js'
import reducePianoroll from './reducePianoroll.js'
import reduceCursor from './reduceCursor.js'

import { combineReducers } from 'redux'

var reduceBranches = combineReducers({
  navigation: reduceNavigation,
  transport: reduceTransport,
  phrase: reducePhrase,
  mixer: reduceMixer,
  pianoroll: reducePianoroll,
  cursor: reduceCursor
})


// ============================================================================
// Top Level Reducers
// ============================================================================
// However, there are certain actions that are dependent on data from more than
// one branch of the state. We will call these "Top Level Reducers," and they
// will be given access to the ENTIRE state, for those reductions that need it.
//
// Below we employ a hybrid solution to combine
// state branches via combineReducers() and any "Top Level Reducers"
// are layered overtop.
import { createStore } from 'redux'
import reduceAll from './reduceAll.js'

export function finalReducer(state = {}, action) {

  // Reduce Branches
  state = reduceBranches(state, action)

  // Top Level Reduction
  return reduceAll(state, action)
} 

export default createStore(finalReducer)
