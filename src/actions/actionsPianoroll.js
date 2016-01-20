import { pianoroll } from './actions.js'

export const pianorollScrollX             = (min, max)        => ({type: pianoroll.SCROLL_X, min, max})
export const pianorollScrollY             = (min, max)        => ({type: pianoroll.SCROLL_Y, min, max})
export const pianorollResizeWidth         = (width )          => ({type: pianoroll.RESIZE_WIDTH,  width })
export const pianorollResizeHeight        = (height)          => ({type: pianoroll.RESIZE_HEIGHT, height })
export const pianorollSelectionStart      = (x, y)            => ({type: pianoroll.SELECTION_START, x, y})
export const pianorollSelectionEnd        = (x, y)            => ({type: pianoroll.SELECTION_END,   x, y})
export const pianorollMoveCursor          = (percent)         => ({type: pianoroll.MOVE_CURSOR, percent})
