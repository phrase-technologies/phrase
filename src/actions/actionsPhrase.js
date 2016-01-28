import { phrase } from './actions.js'

export const phraseCreateTrack            = ()                        => ({type: phrase.CREATE_TRACK})
export const phraseCreateClip             = (trackID, bar)            => ({type: phrase.CREATE_CLIP, trackID, bar})
export const phraseCreateNote             = (trackID, key, bar)       => ({type: phrase.CREATE_NOTE, trackID, key, bar})
export const phraseSelectClip             = (trackID, clipID, union)  => ({type: phrase.SELECT_CLIP, trackID, clipID, union})
export const phraseSelectNote             = (trackID, noteID, union)  => ({type: phrase.SELECT_NOTE, trackID, noteID, union})
export const phraseMovePlayhead           = (bar)                     => ({type: phrase.MOVE_PLAYHEAD, bar})
