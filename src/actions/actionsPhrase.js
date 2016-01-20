import { phrase } from './actions.js'

export const phraseCreateTrack            = ()                  => ({type: phrase.CREATE_TRACK})
export const phraseCreateClip             = (trackID, bar)      => ({type: phrase.CREATE_CLIP, trackID, bar})
export const phraseCreateNote             = (trackID, key, bar) => ({type: phrase.CREATE_NOTE, trackID, key, bar})
export const phraseSelectNote             = (trackID, noteID)   => ({type: phrase.SELECT_NOTE, trackID, noteID})
export const phraseMovePlayhead           = (bar)               => ({type: phrase.MOVE_PLAYHEAD, bar})
