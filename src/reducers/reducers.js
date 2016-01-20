import { combineReducers } from 'redux'

import navigation from './reduceNavigation.js'
import transport from './reduceTransport.js'
import phrase from './reducePhrase.js'
import mixer from './reduceMixer.js'
import pianoroll from './reducePianoroll.js'
import cursor from './reduceCursor.js'

const musicApp = combineReducers({
  navigation,
  transport,
  phrase,
  mixer,
  pianoroll,
  cursor
})

export default musicApp