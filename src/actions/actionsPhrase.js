import { phrase } from './actions.js'

export const phraseCreateTrack            = ()                        => ({type: phrase.CREATE_TRACK})
export const phraseCreateClip             = (trackID, bar)            => ({type: phrase.CREATE_CLIP, trackID, bar})
export const phraseCreateNote             = (trackID, bar, key)       => ({type: phrase.CREATE_NOTE, trackID, bar, key})
export const phraseSelectClip             = (clipID, union)           => ({type: phrase.SELECT_CLIP, clipID, union})
export const phraseSelectNote             = (noteID, union)           => ({type: phrase.SELECT_NOTE, noteID, union})
export const phraseDeleteNote             = (noteID)                  => ({type: phrase.DELETE_NOTE, noteID})
export const phraseDragClipSelection      = (bar, track)              => ({type: phrase.DRAG_CLIP_SELECTION, bar, track})
export const phraseDragNoteSelection      = (bar, key)                => ({type: phrase.DRAG_NOTE_SELECTION, bar, key})
export const phraseMovePlayhead           = (bar)                     => ({type: phrase.MOVE_PLAYHEAD, bar})
