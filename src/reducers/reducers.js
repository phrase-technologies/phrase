import { combineReducers } from 'redux'

import navigation from './reducerNavigation.js'
import transport from './reducerTransport.js'
import mixer from './reducerMixer.js'
import pianoroll from './reducerPianoroll.js'
import cursor from './reducerCursor.js'

const musicApp = combineReducers({
  navigation,
  transport,
  mixer,
  pianoroll,
  cursor
})

export default musicApp