import { namespaceActions } from '../helpers/actionsHelpers.js'

export const auth = namespaceActions(
  'auth',
  [
    'LOGIN_REQUEST',
    'LOGIN_SUCCESS',
    'LOGIN_FAIL',
    'LOGOUT',
  ]
)

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
    'PLAY_TOGGLE',
    'MOVE_PLAYHEAD',
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
    'ARM_TRACK',
    'MUTE_TRACK',
    'SOLO_TRACK',
    'SET_TEMPO',
    'CREATE_CLIP',
    'CREATE_NOTE',
    'SELECT_CLIP',
    'SELECT_NOTE',
    'DELETE_SELECTION',
    'DELETE_NOTE',
    'DRAG_CLIP_SELECTION',
    'DRAG_NOTE_SELECTION',
    'DROP_CLIP_SELECTION',
    'DROP_NOTE_SELECTION',
    'LOAD',
  ]
)

export const library = namespaceActions(
  `library`,
  [
    'SAVE',
    'LOAD_ALL',
  ]
)

export const modal = namespaceActions(
  'modal',
  [
    'OPEN',
    'CLOSE',
  ]
)

export const mixer = namespaceActions(
  'mixer',
  [
    'SCROLL_X',
    'SCROLL_Y',
    'RESIZE_WIDTH',
    'RESIZE_HEIGHT',
    'SELECTION_BOX_START',
    'SELECTION_BOX_RESIZE',
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
    'SELECTION_BOX_START',
    'SELECTION_BOX_RESIZE',
    'SELECTION_BOX_APPLY',
    'SET_FOCUS_WINDOW',
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
    'RESIZE_LOOP',
    'RESIZE_RIGHT_CLIP',
    'RESIZE_RIGHT_LOOP',
    'RESIZE_RIGHT_CLIPPED',
    'RESIZE_RIGHT_LOOPED',
    'CLEAR'
  ]
)
