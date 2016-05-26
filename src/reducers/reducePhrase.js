import u from 'updeep'
import { api } from 'helpers/ajaxHelpers'
import { uIncrement, uAppend } from 'helpers/arrayHelpers'

import { phrase, mixer } from 'actions/actions'
import { clipSelectionOffsetValidated,
         noteSelectionOffsetValidated,
       } from 'selectors/selectorPianoroll'
import { getOffsetedTrackID,
         getTracksHeight,
       } from 'helpers/trackHelpers'
import { negativeModulus } from 'helpers/intervalHelpers'
import { push } from 'react-router-redux'
import { ActionCreators as UndoActions } from 'redux-undo'

// ============================================================================
// Phrase Action Creators
// ============================================================================
export const phraseRename = (name) => ({ type: phrase.RENAME, name })
export const phraseCreateTrack = (actionConfig) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_TRACK, ...actionConfig })

    // Take measurements after the new track is created, adjust height
    let state = getState()
    let mixerContentHeight = getTracksHeight(state.phrase.present.tracks)
    let height = state.mixer.height
    dispatch({ type: mixer.RESIZE_HEIGHT, height, mixerContentHeight })
  }
}
export const phraseArmTrack               = (trackID)                 => ({type: phrase.ARM_TRACK, trackID})
export const phraseMuteTrack              = (trackID)                 => ({type: phrase.MUTE_TRACK, trackID})
export const phraseSoloTrack              = (trackID)                 => ({type: phrase.SOLO_TRACK, trackID})
export const phraseSetTempo               = (tempo)                   => ({type: phrase.SET_TEMPO, tempo})
export const phraseCreateClip = (trackID, bar) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_CLIP, trackID, bar })

    // Select the clip after it's created
    let state = getState()
    let clips = state.phrase.present.clips
    let newClip = clips[clips.length - 1]
    dispatch({ type: phrase.SELECT_CLIP, clipID: newClip.id, union: false })
  }
}
export const phraseCreateNote = (trackID, bar, key) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_NOTE, trackID, bar, key })

    // Select the note after it's created
    let state = getState()
    let notes = state.phrase.present.notes
    let newNote = notes[notes.length - 1]
    dispatch({ type: phrase.SELECT_NOTE, noteID: newNote.id, union: false })
  }
}
export const phraseSelectClip             = (clipID, union)           => ({type: phrase.SELECT_CLIP, clipID, union})
export const phraseSelectNote             = (noteID, union)           => ({type: phrase.SELECT_NOTE, noteID, union})
export const phraseDeleteSelection = () => {
  // We need to know the selection - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let clipIDs = state.phraseMeta.clipSelectionIDs
    let noteIDs = state.phraseMeta.noteSelectionIDs
    dispatch({ type: phrase.DELETE_SELECTION, clipIDs, noteIDs })
  }
}
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
    let clipIDs = state.phraseMeta.clipSelectionIDs
    dispatch({ type: phrase.DROP_CLIP_SELECTION, clipIDs, offsetStart, offsetEnd, offsetTrack, offsetLooped })
  }
}
export const phraseDropNoteSelection = () => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let { offsetStart, offsetEnd, offsetKey } = noteSelectionOffsetValidated(state)
    let noteIDs = state.phraseMeta.noteSelectionIDs
    dispatch({ type: phrase.DROP_NOTE_SELECTION, noteIDs, offsetStart, offsetEnd, offsetKey })
  }
}
export const phraseLoadFromMemory = ({ id, name, username, dateCreated, dateModified, state }) => {
  return {
    type: phrase.LOAD_FINISH,
    payload: {
      id,
      name,
      username,
      dateCreated,
      dateModified,
      state,
    }
  }
}
export const phraseLoadFromDb = phraseId => {
  return async (dispatch) => {
    dispatch({ type: phrase.LOAD_START })
    let { loadedPhrase } = await api({ endpoint: `loadOne`, body: { phraseId } })
    if (loadedPhrase) {
      dispatch({
        type: phrase.LOAD_FINISH,
        payload: {
          id: phraseId,
          name: loadedPhrase.phrasename,
          username: loadedPhrase.username,
          dateCreated: loadedPhrase.dateCreated,
          dateModified: loadedPhrase.dateModified,
          state: loadedPhrase.state,
        }
      })
    } else {
      console.error('phraseLoadFromDb() Failed!')
    }
  }
}
export const phraseSaveStart  = () => ({ type: phrase.SAVE_START  })
export const phraseSaveFinish = () => ({ type: phrase.SAVE_FINISH, payload: { timestamp: Date.now() } })
export const phraseNewPhrase = () => {
  return dispatch => {
    dispatch(push(`/phrase/new`))
    dispatch({ type: phrase.NEW_PHRASE })
    dispatch(UndoActions.clearHistory())
    localStorage.removeItem('reduxPersist:phrase')
    localStorage.removeItem('reduxPersist:phraseMeta')
    setTimeout(() => {
      dispatch({ type: phrase.NEW_PHRASE_LOADED })
    }, 256)
  }
}

// ============================================================================
// Phrase Reducer
// ============================================================================
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

export const defaultState = reduceCreateTrack(reduceCreateTrack({
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
}, {}), {})

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.CREATE_TRACK:
      return reduceCreateTrack(state, action)

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
    case phrase.SET_TEMPO:
      return u({
        tempo: action.tempo
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
      return u({
        clips: u.reject(clip => action.clipIDs.includes(clip.id)),
        notes: u.reject(note => action.noteIDs.includes(note.id) || action.clipIDs.includes(note.clipID))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        clips: clips => {
          return clips.map(clip => {
            // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
            let validatedOffsetLooped = action.offsetLooped || (clip.end - clip.start !== clip.loopLength)

            if (action.clipIDs.some(x => x === clip.id)) {
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
          // Do nothing if no change of track occurred
          if (!action.offsetTrack)
            return notes

          // Change of track occured - make sure appropriate notes are moved also!
          let selectedClips = state.clips.filter(clip => action.clipIDs.some(x => x === clip.id))
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
            if (action.noteIDs.some(x => x === note.id)) {
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

    case phrase.NEW_PHRASE:
      return defaultState

    // ------------------------------------------------------------------------
    default:
      return state
  }
}

function reduceCreateTrack(state, action) {
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
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  if (getClipAtBar(state, action.bar, action.trackID))
    return state

  // Create new clip
  let snappedClipStart = Math.floor(action.bar) + 0.00
  let newClip = u.freeze({
    id:         state.clipAutoIncrement,
    trackID:    action.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + 1.00,
    offset:     0.00,
    loopLength: 1.00,
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
