import { namespaceActions } from '../helpers/actionsHelpers.js'

export const layout = namespaceActions(
  'layout',
  [
    'CONSOLE_EMBED',
    'CONSOLE_SPLIT'
  ]
)

export const transport = namespaceActions(
  'transport',
  [
    'PLAY',
    'STOP',
    'REWIND',
    'RECORD',
    'SET_TEMPO'
  ]
)

export const phrase = namespaceActions(
  'phrase',
  [
    'CREATE_TRACK',
    'CREATE_CLIP',
    'CREATE_NOTE',
    'SELECT_NOTE',
    'MOVE_PLAYHEAD'
  ]
)

export const mixer = namespaceActions(
  'mixer',
  [
    'SCROLL_X',
    'SCROLL_Y',
    'RESIZE_WIDTH',
    'SELECTION_START',
    'SELECTION_END',
    'MOVE_CURSOR',
  ]
)

export const pianoroll = namespaceActions(
  'pianoroll',
  [
    'SCROLL_X',
    'SCROLL_Y',
    'RESIZE_WIDTH',
    'RESIZE_HEIGHT',
    'SELECTION_START',
    'SELECTION_END',
    'MOVE_CURSOR'
  ]
)

export const cursor = namespaceActions(
  'cursor',
  [
    'DEFAULT',
    'DRAG',
    'DROP',
    'RESIZE_COLUMN',
    'RESIZE_ROW',
    'RESIZE_X',
    'RESIZE_Y',
    'RESIZE_LEFT',
    'RESIZE_RIGHT',
    'RESIZE_TOP',
    'RESIZE_BOTTOM',
    'CLEAR'
  ]
)
