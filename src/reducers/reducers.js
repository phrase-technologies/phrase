import { combineReducers } from 'redux';

import navigation from './reducerNavigation.js';
import transport from './reducerTransport.js';
import timeline from './reducerTimeline.js';
import pianoroll from './reducerPianoroll.js';
import cursor from './reducerCursor.js';

const musicApp = combineReducers({
  navigation,
  transport,
  timeline,
  pianoroll,
  cursor
});

export default musicApp;