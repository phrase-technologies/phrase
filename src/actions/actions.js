// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------
export const TRANSPORT_PLAY               = 'TRANSPORT_PLAY';
export const TRANSPORT_STOP               = 'TRANSPORT_STOP';
export const TRANSPORT_REWIND             = 'TRANSPORT_REWIND';


// ----------------------------------------------------------------------------
// Action creators
// ----------------------------------------------------------------------------
export function transportAction(type) {
  switch( type )
  {
    case 'TRANSPORT_PLAY':    return { type: TRANSPORT_PLAY   };
    case 'TRANSPORT_STOP':    return { type: TRANSPORT_STOP   };
    case 'TRANSPORT_REWIND':  return { type: TRANSPORT_REWIND };
    default:                  return { type: null             };
  }
}
