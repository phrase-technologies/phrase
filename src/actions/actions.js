// ----------------------------------------------------------------------------
// Layout Navigation Actions
// ----------------------------------------------------------------------------
export const LAYOUT_CONSOLE_TOGGLE        = 'LAYOUT_CONSOLE_TOGGLE';
export const LAYOUT_CONSOLE_SPLIT         = 'LAYOUT_CONSOLE_SPLIT';
export var layoutConsoleToggle            = () => ({type: LAYOUT_CONSOLE_TOGGLE});
export var layoutConsoleSplit             = (ratio) => ({type: LAYOUT_CONSOLE_SPLIT, ratio});

// ----------------------------------------------------------------------------
// Transport Actions
// ----------------------------------------------------------------------------
export const TRANSPORT_PLAY               = 'TRANSPORT_PLAY';
export const TRANSPORT_STOP               = 'TRANSPORT_STOP';
export const TRANSPORT_REWIND             = 'TRANSPORT_REWIND';
export const TRANSPORT_RECORD             = 'TRANSPORT_RECORD';
export const TRANSPORT_TEMPO              = 'TRANSPORT_TEMPO';
export var transportPlay                  = () => ({type: TRANSPORT_PLAY});
export var transportStop                  = () => ({type: TRANSPORT_STOP});
export var transportRecord                = () => ({type: TRANSPORT_RECORD});
export var transportTempo                 = () => ({type: TRANSPORT_TEMPO});
export var transportTempo                 = () => ({type: TRANSPORT_TEMPO});

// ----------------------------------------------------------------------------
// Transport Actions
// ----------------------------------------------------------------------------
export const PIANOROLL_SCROLL_X           = 'PIANOROLL_SCROLL_X';
export const PIANOROLL_SCROLL_Y           = 'PIANOROLL_SCROLL_Y';
export var pianoRollScrollX               = (min, max) => ({type: PIANOROLL_SCROLL_X, min, max});
export var pianoRollScrollY               = (min, max) => ({type: PIANOROLL_SCROLL_Y, min, max});

// ----------------------------------------------------------------------------
// Mouse Cursor
// ----------------------------------------------------------------------------
export const CURSOR_SET_IMPLICIT          = 'CURSOR_SET_IMPLICIT';
export const CURSOR_SET_EXPLICIT          = 'CURSOR_SET_EXPLICIT';
export var cursorSetImplicit              = (cursor) => ({type: CURSOR_SET_IMPLICIT, cursor});
export var cursorSetExplicit              = (cursor) => ({type: CURSOR_SET_EXPLICIT, cursor});
export const CURSOR_TYPES = {
  'default':  'default',
  'xresize':  'xresize',
  'yresize':  'yresize',
  'grab':     'grab',
  'grabbing': 'grabbing',
  'move':     'move'
};

// ----------------------------------------------------------------------------
// Timeline Cursor (where you are within a music timeline)
// ----------------------------------------------------------------------------
export const TIMELINE_CURSOR              = 'TIMELINE_CURSOR';
export const TIMELINE_PLAYHEAD            = 'TIMELINE_PLAYHEAD';
export var timelineCursor                 = (percent) => ({type: TIMELINE_CURSOR, percent});
export var timelinePlayhead               = (bar) => ({type: TIMELINE_PLAYHEAD, bar});
