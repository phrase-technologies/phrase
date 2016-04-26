import { phrase } from './actions.js'

export const phraseCreateTrack            = ()                        => ({type: phrase.CREATE_TRACK})
export const phraseArmTrack               = (trackID)                 => ({type: phrase.ARM_TRACK, trackID})
export const phraseMuteTrack              = (trackID)                 => ({type: phrase.MUTE_TRACK, trackID})
export const phraseSoloTrack              = (trackID)                 => ({type: phrase.SOLO_TRACK, trackID})
export const phraseCreateClip             = (trackID, bar)            => ({type: phrase.CREATE_CLIP, trackID, bar})
export const phraseCreateNote             = (trackID, bar, key)       => ({type: phrase.CREATE_NOTE, trackID, bar, key})
export const phraseSelectClip             = (clipID, union)           => ({type: phrase.SELECT_CLIP, clipID, union})
export const phraseSelectNote             = (noteID, union)           => ({type: phrase.SELECT_NOTE, noteID, union})
export const phraseDeleteSelection        = ()                        => ({type: phrase.DELETE_SELECTION})
export const phraseDeleteNote             = (noteID)                  => ({type: phrase.DELETE_NOTE, noteID})
export const phraseDragClipSelection = (clipID, start, end, looped, track, snap) => {
  return {
    type: phrase.DRAG_CLIP_SELECTION,
    clipID,
    start,
    end,
    looped,
    track,
    snap
  }
}
export const phraseDragNoteSelection = (noteID, start, end, key, snap) => {
  return {
    type: phrase.DRAG_NOTE_SELECTION,
    noteID,
    start,
    end,
    key,
    snap
  }
}
export const phraseDropNoteSelection = () => ({type: phrase.DROP_NOTE_SELECTION})
export const phraseDropClipSelection = () => ({type: phrase.DROP_CLIP_SELECTION})
