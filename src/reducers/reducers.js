import { combineReducers } from 'redux';
import { TRANSPORT_PLAY, TRANSPORT_STOP, TRANSPORT_REWIND } from '../actions/actions.js';


function transportControls(state = [], action) {
  switch (action.type) {
    case TRANSPORT_PLAY:
      return Object.assign({}, state, {playing: true});
    case TRANSPORT_STOP:
      return Object.assign({}, state, {playing: false});
    default:
      return state;
  }
}

const musicApp = combineReducers({
  transportControls
});

export default musicApp;