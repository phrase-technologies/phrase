import { pianoroll } from './actions.js'

export const pianorollScrollX             = (min, max)        => ({type: pianoroll.SCROLL_X, min, max})
export const pianorollScrollY             = (min, max)        => ({type: pianoroll.SCROLL_Y, min, max})
export const pianorollResizeWidth         = (width )          => ({type: pianoroll.RESIZE_WIDTH,  width })
export const pianorollResizeHeight        = (height)          => ({type: pianoroll.RESIZE_HEIGHT, height })
export const pianorollSelectionBoxStart   = (x, y)            => ({type: pianoroll.SELECTION_BOX_START,  x, y})
export const pianorollSelectionBoxResize  = (x, y)            => ({type: pianoroll.SELECTION_BOX_RESIZE, x, y})
export const pianorollSelectionBoxApply   = (union)           => ({type: pianoroll.SELECTION_BOX_APPLY, union})
export const pianorollSetFocusWindow = (track, start, end) => {
  return {
    type: pianoroll.SET_FOCUS_WINDOW,
    track: track,
    start: start,
    end: end
  }
}
export const pianorollMoveCursor          = (percent)         => ({type: pianoroll.MOVE_CURSOR, percent})
