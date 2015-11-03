// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------
export const TRANSPORT_PLAY               = 'TRANSPORT_PLAY';
export const TRANSPORT_STOP               = 'TRANSPORT_STOP';
export const TRANSPORT_REWIND             = 'TRANSPORT_REWIND';
export const TRANSPORT_RECORD             = 'TRANSPORT_RECORD';
export const TRANSPORT_TEMPO              = 'TRANSPORT_TEMPO';

// ----------------------------------------------------------------------------
// Action creators
// ----------------------------------------------------------------------------
export function transportAction(type, value) {
  switch( type )
  {
    case 'TRANSPORT_PLAY':    return { type: TRANSPORT_PLAY   };
    case 'TRANSPORT_STOP':    return { type: TRANSPORT_STOP   };
    case 'TRANSPORT_REWIND':  return { type: TRANSPORT_REWIND };
    case 'TRANSPORT_RECORD':  return { type: TRANSPORT_RECORD };
    case 'TRANSPORT_TEMPO':   return { type: TRANSPORT_TEMPO, tempo: value };
    default:                  return { type: null             };
  }
}
