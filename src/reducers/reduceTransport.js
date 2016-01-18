// ============================================================================
// Transport Controls
// ============================================================================

import { transport } from '../actions/actions.js';

export default function reduceTransport(state = {}, action) {
  switch (action.type)
  {
    case transport.PLAY:
      return Object.assign({}, state, {playing: true});
    case transport.STOP:
      return Object.assign({}, state, {playing: false});
    case transport.RECORD:
      return Object.assign({}, state, {recording: !state.recording});
    case transport.SET_TEMPO:
      return Object.assign({}, state, {tempo: action.tempo});
    default:
      return state;
  }
}
