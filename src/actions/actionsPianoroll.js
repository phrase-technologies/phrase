import { pianoroll } from './actions.js'

export var pianorollScrollX               = (min, max) => ({type: pianoroll.SCROLL_X, min, max})
export var pianorollScrollY               = (min, max) => ({type: pianoroll.SCROLL_Y, min, max})
export var pianorollResizeWidth           = (width )   => ({type: pianoroll.RESIZE_WIDTH,  width })
export var pianorollResizeHeight          = (height)   => ({type: pianoroll.RESIZE_HEIGHT, height })
export var pianorollSelectionStart        = (x, y)     => ({type: pianoroll.SELECTION_START, x, y})
export var pianorollSelectionEnd          = (x, y)     => ({type: pianoroll.SELECTION_END,   x, y})
export var pianorollMoveCursor            = (percent)  => ({type: pianoroll.MOVE_CURSOR, percent})
export var pianorollPlayhead              = (percent)  => ({type: pianoroll.MOVE_PLAYHEAD, percent})
export var pianorollCreateNote            = (key, bar) => ({type: pianoroll.CREATE_NOTE, key, bar})
export var pianorollSelectNote            = (id)       => ({type: pianoroll.SELECT_NOTE, id})
