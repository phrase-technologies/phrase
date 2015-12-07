import { combineReducers } from 'redux';
import navigation from './reducerNavigation.js';
import transport from './reducerTransport.js';
import pianoRoll from './reducerPianoRoll.js';
import cursor from './reducerCursor.js';

const musicApp = combineReducers({
  navigation,
  transport,
  pianoRoll,
  cursor
});

export default musicApp;