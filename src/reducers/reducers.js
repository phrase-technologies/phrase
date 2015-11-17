import { combineReducers } from 'redux';
import transport from './reducerTransport';
import pianoRoll from './reducerPianoRoll';
import cursor from './cursor';

const musicApp = combineReducers({
  transport,
  pianoRoll,
  cursor
});

export default musicApp;