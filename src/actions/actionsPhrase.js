import { phrase } from './actions.js'

export const phraseCreateTrack            = ()                        => ({type: phrase.CREATE_TRACK})
export const phraseCreateClip             = (trackID, bar)            => ({type: phrase.CREATE_CLIP, trackID, bar})
export const phraseCreateNote             = (trackID, bar, key)       => ({type: phrase.CREATE_NOTE, trackID, bar, key})
export const phraseSelectClip             = (clipID, union)           => ({type: phrase.SELECT_CLIP, clipID, union})
export const phraseSelectNote             = (noteID, union)           => ({type: phrase.SELECT_NOTE, noteID, union})
export const phraseDeleteClip = (clipID) => ({type: phrase.DELETE_CLIP, clipID})
export const phraseDeleteNote = (noteID) => ({type: phrase.DELETE_NOTE, noteID})
export const phraseDragClipSelection = (clipID, start, end, looped, track, snap) => {
  return {
    type: phrase.DRAG_CLIP_SELECTION,
    clipID: clipID,
    start: start,
    end: end,
    looped: looped,
    track: track,
    snap: snap
  }
}
export const phraseDragNoteSelection = (noteID, start, end, key, snap) => {
  return {
    type: phrase.DRAG_NOTE_SELECTION,
    noteID: noteID,
    start: start,
    end: end,
    key: key,
    snap: snap
  }
}
export const phraseDropNoteSelection = () => ({type: phrase.DROP_NOTE_SELECTION})
export const phraseDropClipSelection = () => ({type: phrase.DROP_CLIP_SELECTION})
export const phraseMovePlayhead           = (bar)                     => ({type: phrase.MOVE_PLAYHEAD, bar})
