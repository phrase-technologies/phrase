// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------
export const NAV_CONSOLE_TOGGLE           = 'NAV_CONSOLE_TOGGLE';

export const TRANSPORT_PLAY               = 'TRANSPORT_PLAY';
export const TRANSPORT_STOP               = 'TRANSPORT_STOP';
export const TRANSPORT_REWIND             = 'TRANSPORT_REWIND';
export const TRANSPORT_RECORD             = 'TRANSPORT_RECORD';
export const TRANSPORT_TEMPO              = 'TRANSPORT_TEMPO';

export const PIANOROLL_SCROLL_X           = 'PIANOROLL_SCROLL_X';
export const PIANOROLL_SCROLL_Y           = 'PIANOROLL_SCROLL_Y';

export const CURSOR_SET_IMPLICIT          = 'CURSOR_SET_IMPLICIT';
export const CURSOR_SET_EXPLICIT          = 'CURSOR_SET_EXPLICIT';
export const CURSOR_TYPES = {
  'default':  'default',
  'xresize':  'xresize',
  'yresize':  'yresize',
  'grab':     'grab',
  'grabbing': 'grabbing',
  'move':     'move'
};

// ----------------------------------------------------------------------------
// Action creators
// ----------------------------------------------------------------------------
export function navConsoleToggle() {
  return {
    type: NAV_CONSOLE_TOGGLE
  };
}

export function transportPlay() {
  return {
    type: TRANSPORT_PLAY
  };
}
export function transportStop() {
  return {
    type: TRANSPORT_STOP
  };
}
export function transportRecord() {
  return {
    type: TRANSPORT_RECORD
  };
}
export function transportTempo(tempo) {
  return {
    type: TRANSPORT_TEMPO,
    tempo: tempo
  };
}

export function pianoRollScrollX(newMin, newMax) {
  return {
    type: PIANOROLL_SCROLL_X,
    min: newMin,
    max: newMax
  };
}
export function pianoRollScrollY(newMin, newMax) {
  return {
    type: PIANOROLL_SCROLL_Y,
    min: newMin,
    max: newMax
  };
}

export function cursorSetImplicit(cursor) {
  return {
    type: CURSOR_SET_IMPLICIT,
    cursor: cursor
  };
}
export function cursorSetExplicit(cursor) {
  return {
    type: CURSOR_SET_EXPLICIT,
    cursor: cursor
  };
}
