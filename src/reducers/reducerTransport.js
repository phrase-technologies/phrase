// ============================================================================
// Transport Controls
// ============================================================================

import { TRANSPORT_PLAY,
         TRANSPORT_STOP,
         TRANSPORT_REWIND,
         TRANSPORT_RECORD,
         TRANSPORT_TEMPO } from '../actions/actions.js';

export default function transport(state = {}, action) {
  switch (action.type)
  {
    case TRANSPORT_PLAY:
      return Object.assign({}, state, {playing: true});
    case TRANSPORT_STOP:
      return Object.assign({}, state, {playing: false});
    case TRANSPORT_RECORD:
      return Object.assign({}, state, {recording: !state.recording});
    case TRANSPORT_TEMPO:
      return Object.assign({}, state, {tempo: action.tempo});
    default:
      return state;
  }
}
