// ----------------------------------------------------------------------------
// Layout Navigation Actions
// ----------------------------------------------------------------------------
export const LAYOUT_CONSOLE_EMBED         = 'LAYOUT_CONSOLE_EMBED';
export const LAYOUT_CONSOLE_SPLIT         = 'LAYOUT_CONSOLE_SPLIT';
export var layoutConsoleEmbedded          = () => ({type: LAYOUT_CONSOLE_EMBED});
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
// Piano Roll Actions
// ----------------------------------------------------------------------------
export const PIANOROLL_SCROLL_X           = 'PIANOROLL_SCROLL_X';
export const PIANOROLL_SCROLL_Y           = 'PIANOROLL_SCROLL_Y';
export const PIANOROLL_WIDTH              = 'PIANOROLL_WIDTH';
export const PIANOROLL_HEIGHT             = 'PIANOROLL_HEIGHT';
export const PIANOROLL_SELECTION_START    = 'PIANOROLL_SELECTION_START';
export const PIANOROLL_SELECTION_END      = 'PIANOROLL_SELECTION_END';
export const PIANOROLL_NEW_NOTE           = 'PIANOROLL_NEW_NOTE';
export var pianorollScrollX               = (min, max) => ({type: PIANOROLL_SCROLL_X, min, max});
export var pianorollScrollY               = (min, max) => ({type: PIANOROLL_SCROLL_Y, min, max});
export var pianorollWidth                 = (width ) => ({type: PIANOROLL_WIDTH,  width });
export var pianorollHeight                = (height) => ({type: PIANOROLL_HEIGHT, height });
export var pianorollSelectionStart        = (x, y) => ({type: PIANOROLL_SELECTION_START, x, y});
export var pianorollSelectionEnd          = (x, y) => ({type: PIANOROLL_SELECTION_END,   x, y});
export var pianorollNewNote               = (key, bar) => ({type: PIANOROLL_NEW_NOTE, key, bar});

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
  'rowresize':  'rowresize',
  'colresize':  'colresize',
  'grab':     'grab',
  'grabbing': 'grabbing',
  'move':     'move',
  'left':     'left',
  'right':    'right',
  'top':      'top',
  'bottom':   'bottom'
};

// ----------------------------------------------------------------------------
// Timeline Cursor (where you are within a music timeline)
// ----------------------------------------------------------------------------
export const TIMELINE_CURSOR              = 'TIMELINE_CURSOR';
export const TIMELINE_PLAYHEAD            = 'TIMELINE_PLAYHEAD';
export var timelineCursor                 = (percent) => ({type: TIMELINE_CURSOR, percent});
export var timelinePlayhead               = (bar) => ({type: TIMELINE_PLAYHEAD, bar});
