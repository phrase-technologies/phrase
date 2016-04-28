import u from 'updeep'
import { uIncrement, uAppend } from '../helpers/arrayHelpers.js'

import { phrase, mixer } from '../actions/actions.js'
import { clipSelectionOffsetValidated,
         noteSelectionOffsetValidated,
       } from '../selectors/selectorPianoroll.js'
import { getOffsetedTrackID,
         getTracksHeight,
       } from '../helpers/trackHelpers.js'
import { negativeModulus } from '../helpers/intervalHelpers.js'

// ============================================================================
// Phrase Action Creators
// ============================================================================
export const phraseCreateTrack = () => {
  // We need to know the height of the mixer - use a thunk to access other state branches
  return (dispatch, getState) => {
    dispatch({type: phrase.CREATE_TRACK})

    // Take measurements after the new track is created
    let state = getState()
    let mixerContentHeight = getTracksHeight(state.phrase.present.tracks)
    let height = state.mixer.height
    dispatch({type: mixer.RESIZE_HEIGHT, height, mixerContentHeight})
  }
}
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
export const phraseDropClipSelection = () => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let { offsetStart, offsetEnd, offsetTrack, offsetLooped } = clipSelectionOffsetValidated(state)
    dispatch({ type: phrase.DROP_CLIP_SELECTION, offsetStart, offsetEnd, offsetTrack, offsetLooped })
  }
}
export const phraseDropNoteSelection = () => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let { offsetStart, offsetEnd, offsetKey } = noteSelectionOffsetValidated(state)
    dispatch({ type: phrase.DROP_NOTE_SELECTION, offsetStart, offsetEnd, offsetKey })
  }
}


// ============================================================================
// Phrase Reducer
// ============================================================================
export const defaultState = {
  barCount: 16.00,
  tempo: 120,
  tracks: [],
  clips: [],
  notes: [],
  trackAutoIncrement: 0,
  colorAutoIncrement: 0,
  noteAutoIncrement:  0,
  clipAutoIncrement:  0,
  noteLengthLast: 0.25
}

const TRACK_COLORS = [
  '#F53',
  '#F80',
  '#FC0',
  '#8D0',
  '#0C0',
  '#0C8',
  '#0DD',
  '#48F',
  '#88F',
  '#A6E',
  '#D6D',
  '#F4A'
]

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.CREATE_TRACK:
      console.log(state.trackAutoIncrement)
      return u({
        tracks: uAppend(
          {
            id: state.trackAutoIncrement,
            name: action.name || 'Track '+(state.trackAutoIncrement+1),
            color: TRACK_COLORS[state.colorAutoIncrement%TRACK_COLORS.length],
            arm:  false,
            mute: false,
            solo: false
          }
        ),
        trackAutoIncrement: state.trackAutoIncrement+1,
        colorAutoIncrement: state.colorAutoIncrement+1
      }, state)

    // ------------------------------------------------------------------------
    case phrase.ARM_TRACK:
      return u({
        tracks: u.updateIn(['*'], u.ifElse(
          (track) => track.id === action.trackID,
          (track) => u({arm: !track.arm}, track),
          (track) => u({arm: false}, track)
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.MUTE_TRACK:
      return u({
        tracks: u.updateIn(['*'], u.if(
          (track) => track.id === action.trackID,
          (track) => u({mute: !track.mute}, track)
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SOLO_TRACK:
      return u({
        tracks: u.updateIn(['*'], u.if(
          (track) => track.id === action.trackID,
          (track) => u({solo: !track.solo}, track)
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.CREATE_CLIP:
      return reduceCreateClip(
        state,
        action
      )

    // ------------------------------------------------------------------------
    case phrase.CREATE_NOTE:
      return reduceCreateNote(
        state,
        action
      )

    // ------------------------------------------------------------------------
    case phrase.SELECT_CLIP:
      return u({
        notes: u.updateIn(['*', 'selected'], false),
        clips: u.updateIn(['*'], u.ifElse(
          (clip) => clip.id === action.clipID,
          (clip) => u({selected: (action.union ? !clip.selected : true)}, clip),
          (clip) => u({selected: (action.union ?  clip.selected : false)}, clip)
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_NOTE:
      return u({
        clips: u.updateIn(['*', 'selected'], false),
        notes: u.updateIn(['*'], u.ifElse(
          (note) => note.id === action.noteID,
          (note) => u({selected: (action.union ? !note.selected : true)}, note),
          (note) => u({selected: (action.union ?  note.selected : false)}, note)
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_NOTE:
      return u({
        notes: u.reject(note => note.id === action.noteID)
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_CLIP:
      return u({
        clips: u.reject(clip => clip.id     === action.clipID),
        notes: u.reject(note => note.clipID === action.clipID)
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      // If clips were deleted, must keep track to delete corresponding notes
      let selectedClipIDs = state.clips
        .filter(clip => clip.selected)
        .map(clip => clip.id)

      return u({
        clips: u.reject(clip => clip.selected),
        notes: u.reject(note => note.selected || selectedClipIDs.includes(note.clipID))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        clips: clips => {
          return clips.map(clip => {
            // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
            let validatedOffsetLooped = action.offsetLooped || (clip.end - clip.start !== clip.loopLength)

            if (clip.selected) {
              return u({
                start:  clip.start  + action.offsetStart,
                end:    clip.end    + action.offsetEnd,
                offset: validatedOffsetLooped && action.offsetStart !== action.offsetEnd ? negativeModulus(clip.offset - action.offsetStart, clip.loopLength) : clip.offset,
                loopLength: validatedOffsetLooped ? clip.loopLength : clip.end + action.offsetEnd - clip.start - action.offsetStart,
                trackID: getOffsetedTrackID(clip.trackID, action.offsetTrack, state.tracks)
              }, clip)
            }
            return clip
          })
        },
        notes: notes => {
          // Do nothing if no change of track occured
          if (!action.offsetTrack)
            return notes

          // Change of track occured - make sure appropriate notes are moved also!
          let selectedClips = state.clips.filter(clip => clip.selected)
          return notes.map(note => {
            let clipMoved = selectedClips.find(clip => clip.id === note.clipID)
            if (clipMoved) {
              return u({
                trackID: getOffsetedTrackID(note.trackID, action.offsetTrack, state.tracks)
              }, note)
            }
            return note
          })
        },
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION:
      return u({
        notes: notes => {
          return notes.map(note => {
            if (note.selected) {
              return u({
                start:  note.start  + action.offsetStart,
                end:    note.end    + action.offsetEnd,
                keyNum: note.keyNum + action.offsetKey
              }, note)
            }
            return note
          })
        },
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  if (getClipAtBar(state, action.bar, action.trackID))
    return state

  // Deselect all existing clips and notes
  state = u({
    clips: u.updateIn(['*', 'selected'], false),
    notes: u.updateIn(['*', 'selected'], false)
  }, state)

  // Create new clip
  let snappedClipStart = Math.floor(action.bar) + 0.00
  let newClip = u.freeze({
    id:         state.clipAutoIncrement,
    trackID:    action.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + 1.00,
    offset:     0.00,
    loopLength: 1.00,
    selected:   true
  })

  // Insert
  return u({
    clips: uAppend(newClip),
    clipAutoIncrement: uIncrement(1)
  }, state)
}

function reduceCreateNote(state, action) {
  // Skip if note already exists
  if (getNoteAtKeyBar(state, action.key, action.bar, action.trackID))
    return state

  // Create clip if necessary
  state = reduceCreateClip(state, action)
  let foundClip = getClipAtBar(state, action.bar, action.trackID)

  // Deselect all existing clips and notes
  state = u({
    clips: u.updateIn(['*', 'selected'], false),
    notes: u.updateIn(['*', 'selected'], false)
  }, state)

  // Insert note, snap to same length as most previously created note
  let snappedNoteKey   = Math.ceil(action.key)
  let snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast
  let newNote = u.freeze({
    id:       state.noteAutoIncrement,
    trackID:  action.trackID,
    clipID:   foundClip.id,
    keyNum:   snappedNoteKey,
    start:    snappedNoteStart - foundClip.start,
    end:      snappedNoteStart - foundClip.start + state.noteLengthLast,
    selected: true
  })

  // Update State
  return u({
    notes: uAppend(newNote),
    noteAutoIncrement: uIncrement(1)
  }, state)
}

export function getClipAtBar(state, bar, trackID) {
  return state.clips.find((clip) => {
    return clip.trackID === trackID && bar >= clip.start && bar < clip.end
  })
}

export function getNoteAtKeyBar(state, key, bar, trackID) {
  let snappedNoteKey = Math.ceil(key)
  return state.notes.find(note => {
    // Ignore notes on different keys
    if (note.keyNum !== snappedNoteKey)
      return false

    // Find corresponding clip
    let clip = state.clips.find(clip => {
      return clip.trackID === trackID && clip.id === note.clipID
    })

    // Ignore notes on different tracks
    if (!clip)
      return false

    // Ignore clips the end before or start after this point
    if (bar < clip.start || clip.end <= bar)
      return false

    // Find iteration of the clip's loops that the note would fall into
    let loopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
    while(loopStart + clip.loopLength < bar) {
      loopStart += clip.loopLength
    }

    // Check if note matches exact timing
    return (
      bar >= loopStart + note.start &&
      bar <  loopStart + note.end
    )
  })
}
