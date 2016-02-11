import { cursor } from './actions.js'

const cursorSetIcon = (cursorTYPE) => ({ type: cursorTYPE })

export const cursorDefault      = cursorSetIcon(cursor.DEFAULT)
export const cursorDrag         = cursorSetIcon(cursor.DRAG)
export const cursorDrop         = cursorSetIcon(cursor.DROP)
export const cursorResizeColumn = cursorSetIcon(cursor.RESIZE_COLUMN)
export const cursorResizeRow    = cursorSetIcon(cursor.RESIZE_ROW)
export const cursorResizeX      = cursorSetIcon(cursor.RESIZE_X)
export const cursorResizeY      = cursorSetIcon(cursor.RESIZE_Y)
export const cursorResizeLeft   = cursorSetIcon(cursor.RESIZE_LEFT)
export const cursorResizeRight  = cursorSetIcon(cursor.RESIZE_RIGHT)
export const cursorResizeTop    = cursorSetIcon(cursor.RESIZE_TOP)
export const cursorResizeBottom = cursorSetIcon(cursor.RESIZE_BOTTOM)
export const cursorClear        = cursorSetIcon(cursor.CLEAR)
