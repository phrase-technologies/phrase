import { combineReducers } from 'redux';
import transport from './reducerTransport';
import pianoRoll from './reducerPianoRoll';

const musicApp = combineReducers({
  transport,
  pianoRoll
});

export default musicApp;