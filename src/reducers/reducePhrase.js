import _ from 'lodash'
import u from 'updeep'
import { api } from 'helpers/ajaxHelpers'
import { uIncrement, uAppend } from 'helpers/arrayHelpers'

import { phrase, mixer } from 'actions/actions'

import {
  currentNotesSelector,
  clipSelectionOffsetValidated,
  noteSelectionOffsetValidated,
} from 'selectors/selectorPianoroll'

import { phraseMidiSelector } from 'selectors/selectorTransport'

import {
  getOffsetedTrackID,
  getTracksHeight,
} from 'helpers/trackHelpers'

import { negativeModulus } from 'helpers/intervalHelpers'
import { push } from 'react-router-redux'
import { librarySaveNew } from 'reducers/reduceLibrary'
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

export const phraseArmTrack = (trackID) => ({type: phrase.ARM_TRACK, trackID})
export const phraseMuteTrack = (trackID) => ({type: phrase.MUTE_TRACK, trackID})
export const phraseSoloTrack = (trackID) => ({type: phrase.SOLO_TRACK, trackID})
export const phraseSetTempo = (tempo) => ({type: phrase.SET_TEMPO, tempo})

export const phraseCreateClip = (trackID, bar, end, snapStart = true, ignore) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_CLIP, trackID, bar, end, snapStart, ignore })

    // Select the clip after it's created
    let state = getState()
    let clips = state.phrase.present.clips
    let newClip = clips[clips.length - 1]
    dispatch({ type: phrase.SELECT_CLIP, payload: { clipID: newClip.id, union: false }, ignore })
  }
}

export const phraseCreateNote = (trackID, bar, key, start, end, ignore, snapStart = true) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_NOTE, trackID, bar, key, start, end, ignore, snapStart })

    // Select the note after it's created
    let state = getState()
    let notes = state.phrase.present.notes
    let newNoteID = notes[notes.length - 1].id
    let renderedNotes = currentNotesSelector(state)
    let newNoteLoopIterations = renderedNotes.filter(note => note.id === newNoteID)
    let targetRenderedNote = newNoteLoopIterations.find(note => note.start <= bar && note.end > bar)

    dispatch({
      type: phrase.SELECT_NOTE,
      payload: {
        noteID: newNoteID,
        loopIteration: (targetRenderedNote || {}).loopIteration,
        union: false,
      },
    })
  }
}

export const phraseSelectTrack = ({ trackID, union }) => {
  return (dispatch, getState) => {

    dispatch({
      type: phrase.SELECT_TRACK,
      payload: {
        trackID,
        union,
        clips: getState().phrase.present.clips,
      }
    })
  }
}

export const phraseSelectClip = ({ clipID, union }) => ({
  type: phrase.SELECT_CLIP,
  payload: { clipID, union }
})

export const phraseSelectNote = ({ noteID, loopIteration, union }) => ({
  type: phrase.SELECT_NOTE,
  payload: { noteID, loopIteration, union }
})

export const phraseDeleteSelection = () => {
  // We need to know the selection - use a thunk to access other state branches
  return (dispatch, getState) => {
    let {
      selectionType,
      trackSelectionIDs,
      clipSelectionIDs,
      noteSelectionIDs,
    } = getState().phraseMeta

    // If clip selection was just deleted, delete selected tracks instead
    if (selectionType === "clips" && clipSelectionIDs.length === 0) {
      selectionType = "tracks"
    }

    dispatch({
      type: phrase.DELETE_SELECTION,
      payload: {
        selectionType,
        trackSelectionIDs,
        clipSelectionIDs,
        noteSelectionIDs,
        currentTrack: (selectionType === "tracks") ? getState().pianoroll.currentTrack : null,
      }
    })

    // Track deletion will causer Mixer to require resizing and may cause Pianoroll to disappear
    if (selectionType === "tracks") {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    }
  }
}

export const phraseDeleteNote = (noteID) => ({type: phrase.DELETE_NOTE, noteID})

export const phraseDragClipSelection = ({
  grippedClipID,
  offsetStart,
  offsetEnd,
  offsetLooped,
  offsetTrack,
  offsetSnap,
  offsetCopy
}) => {

  return {
    type: phrase.DRAG_CLIP_SELECTION,
    payload: {
      grippedClipID,
      offsetStart,
      offsetEnd,
      offsetLooped,
      offsetTrack,
      offsetSnap,
      offsetCopy,
    }
  }
}

export const phraseDragNoteSelection = ({
  grippedNoteID,
  targetBar,
  offsetStart,
  offsetEnd,
  offsetKey,
  offsetSnap,
  offsetCopy
}) => {

  return {
    type: phrase.DRAG_NOTE_SELECTION,
    payload: {
      grippedNoteID,
      targetBar,
      offsetStart,
      offsetEnd,
      offsetKey,
      offsetSnap,
      offsetCopy,
    }
  }
}

export const phraseDropClipSelection = () => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let { offsetStart, offsetEnd, offsetTrack, offsetLooped } = clipSelectionOffsetValidated(state)
    let {
      phraseMeta: {
        clipSelectionIDs: clipIDs,
        clipSelectionOffsetCopy: copy,
      },
      phrase: {
        present: {
          clipAutoIncrement: lastExistingClipID,
          noteAutoIncrement: lastExistingNoteID,
        }
      }
    } = state
    dispatch({
      type: phrase.DROP_CLIP_SELECTION,
      payload: {
        clipIDs,
        offsetStart,
        offsetEnd,
        offsetTrack,
        offsetLooped,
        copy,
        lastExistingClipID,
        lastExistingNoteID,
      }
    })
  }
}

export const phraseDropNoteSelection = () => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let { offsetStart, offsetEnd, offsetKey } = noteSelectionOffsetValidated(state)
    let {
      phraseMeta: {
        noteSelectionIDs: noteIDs,
        noteSelectionGrippedID: grippedNoteID,
        noteSelectionTargetBar: targetBar,
        noteSelectionOffsetCopy: copy,
      },
      phrase: {
        present: {
          noteAutoIncrement: lastExistingNoteID,
        }
      }
    } = state
    dispatch({
      type: phrase.DROP_NOTE_SELECTION,
      payload: {
        noteIDs,
        grippedNoteID,
        targetBar,
        offsetStart,
        offsetEnd,
        offsetKey,
        copy,
        lastExistingNoteID,
      }
    })
  }
}

export const phraseSliceClip = ({ bar, trackID, foundClip, snap = 4 }) => {
  return (dispatch, getState) => {

    bar = Math.round(bar * snap) / snap

    if (bar >= foundClip.end) return

    let state = getState()
    let notes = phraseMidiSelector(state).filter(x =>
      x.type === `addNoteOn` && x.clipID === foundClip.id
    )

    let { clips } = state.phrase.present
    let clipsCount = clips.length

    let leftClip = {
      ...foundClip,
      end: bar,
      trackID: clipsCount,
    }

    let rightClip = {
      ...foundClip,
      start: bar,
    }

    let snapStart = false
    let ignore = true

    dispatch({ type: phrase.DELETE_CLIP, clipID: foundClip.id, ignore: true })
    dispatch(phraseCreateClip(trackID, leftClip.start, leftClip.end - leftClip.start, snapStart, ignore))

    // if no notes in sliced clip, do not ignore last clip creation
    ignore = notes.length > 0

    dispatch(phraseCreateClip(trackID, rightClip.start, rightClip.end - rightClip.start, snapStart, ignore))

    notes.forEach((note, i) => {
      let ignore = i < notes.length - 1
      dispatch(phraseCreateNote(trackID, note.start, note.keyNum, note.start, note.end, ignore))
    })
  }
}

export const phraseLoadFromMemory = ({ parentId, id, name, username, dateCreated, dateModified, state }) => {
  return (dispatch) => {
    dispatch({ type: phrase.LOAD_START })
    dispatch({
      type: phrase.LOAD_FINISH,
      payload: {
        parentId,
        id,
        name,
        username,
        dateCreated,
        dateModified,
        state,
      }
    })
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
          parentId: loadedPhrase.parentId,
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

export const phraseSave = () => {
  return (dispatch, getState) => {
    let state = getState()
    dispatch({ type: phrase.SAVE_START  })
    api({
      endpoint: `update`,
      body: {
        phraseId: state.phraseMeta.phraseId,
        phraseName: state.phraseMeta.phraseName,
        phraseState: state.phrase,
      },
    }).then(() => {
      dispatch({ type: phrase.SAVE_FINISH, payload: { timestamp: Date.now() } })
    })
  }
}

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

export const phraseRephrase = () => {
  return (dispatch, getState) => {
    let state = getState()
    let username = state.auth.user.username
    let { authorUsername, phraseId } = state.phraseMeta

    dispatch({
      type: phrase.REPHRASE,
      payload: {
        authorUsername: username,
      },
    })
    // In order to show the "Generating Rephrase" loading screen,
    // we must start from the <Workstation> component.
    // Ensure we start from the original phrase page (e.g. if
    // coming from search page) to make this happen.
    dispatch(push(`/phrase/${authorUsername}/${phraseId}`))

    // If we are starting from a state with unsaved changes, we have to cancel
    // the leaveHook. Use setTimeout to allow rephrased state to reach
    // the <Workstation> component and cancel leaveHook before continuing.
    setTimeout(() => {
      let loggedIn = username && username !== 'undefined'
      if (loggedIn) {
        dispatch(librarySaveNew())
      }
      else {
        dispatch(push(`/phrase/new`))
        dispatch({ type: phrase.NEW_PHRASE_LOADED })
      }
    }, 250)
  }
}

export const phraseLoginReminder    = ({ show }) => ({ type: phrase.LOGIN_REMINDER,    payload: { show } })
export const phraseRephraseReminder = ({ show }) => ({ type: phrase.REPHRASE_REMINDER, payload: { show } })
export const phrasePristine = ({ pristine }) => ({ type: phrase.PRISTINE, payload: { pristine } })

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
      let {
        selectionType,
        trackSelectionIDs,
        clipSelectionIDs,
        noteSelectionIDs,
      } = action.payload
      if (selectionType === "tracks") {
        return u({
          tracks: u.reject(track => trackSelectionIDs.includes(track.id)),
          clips: u.reject(clip => trackSelectionIDs.includes(clip.trackID)),
          notes: u.reject(note => trackSelectionIDs.includes(note.trackID))
        }, state)
      }
      if (selectionType === "clips") {
        return u({
          clips: u.reject(clip => clipSelectionIDs.includes(clip.id)),
          notes: u.reject(note => clipSelectionIDs.includes(note.clipID))
        }, state)
      }
      if (selectionType === "notes") {
        return u({
          notes: u.reject(note => _.has(noteSelectionIDs, note.id))
        }, state)
      }
      return state

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION: {
      // Apply clip changes, and recursively to child notes
      let clipAutoIncrement = state.clipAutoIncrement
      let noteAutoIncrement = state.noteAutoIncrement
      let finalClips
      let finalNotes
      let copyClips = action.payload.copy && action.payload.offsetStart === action.payload.offsetEnd
      let copiedClips = []
      let copiedNotes = []
      let mappedNotes = state.notes
      let mappedClips = u.map(clip => {
        // Even if looping wasn't indicated in the cursor, other selected clips may be already looped and must remain so
        let validatedOffsetLooped = action.payload.offsetLooped || (clip.end - clip.start !== clip.loopLength)

        // Selected clip
        if (action.payload.clipIDs.some(x => x === clip.id)) {
          let newTrackID = getOffsetedTrackID(clip.trackID, action.payload.offsetTrack, state.tracks)
          let truncateOffset = validatedOffsetLooped && action.payload.offsetStart !== action.payload.offsetEnd
          let truncatedOffset = negativeModulus(clip.offset - action.payload.offsetStart, clip.loopLength)
          let modifiedClip = u({
            start:  clip.start  + action.payload.offsetStart,
            end:    clip.end    + action.payload.offsetEnd,
            offset: truncateOffset ? truncatedOffset : clip.offset,
            loopLength: validatedOffsetLooped ? clip.loopLength : clip.end + action.payload.offsetEnd - clip.start - action.payload.offsetStart,
            trackID: newTrackID,
          }, clip)

          // Copy - retain original AND yield new modified clip
          if (copyClips) {
            modifiedClip = u({
              id: clipAutoIncrement,
            }, modifiedClip)
            copiedClips.push(modifiedClip)
            clipAutoIncrement++

            // Also copy the child notes
            let currentNotes = state.notes.filter(note => note.clipID === clip.id)
            currentNotes.forEach(note => {
              copiedNotes.push(u({
                id: noteAutoIncrement,
                clipID: modifiedClip.id,
                trackID: newTrackID,
              }, note))
              noteAutoIncrement++
            })

            return clip
          }

          // No copy - simply modify the original
          return modifiedClip
        }

        // Not selected - no change
        return clip
      }, state.clips)

      finalClips = mappedClips.concat(copiedClips)
      finalNotes = mappedNotes.concat(copiedNotes)

      return u({
        clips: finalClips,
        notes: finalNotes,
        clipAutoIncrement,
        noteAutoIncrement,
      }, state)
    }
    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION: {
      let grippedNote = state.notes.find(note => note.id === action.payload.grippedNoteID)
      let grippedClip = state.clips.find(clip => clip.id === grippedNote.clipID)
      let targetClip = state.clips.find(clip => clip.trackID === grippedNote.trackID && clip.start <= action.payload.targetBar && clip.end > action.payload.targetBar) || grippedClip
      let newNoteLength = grippedNote.end + action.payload.offsetEnd - grippedNote.start - action.payload.offsetStart
      let noteAutoIncrement = state.noteAutoIncrement

      // Apply modifications to notes
      let finalizedNotes
      let copyNotes = action.payload.copy && action.payload.offsetStart === action.payload.offsetEnd
      let copiedNotes = []
      let mappedNotes = u.map(note => {
        // Selected note
        if (_.has(action.payload.noteIDs, note.id)) {
          // Offset note - generate a duplicate with any offset
          if ((action.payload.offsetStart === action.payload.offsetEnd) || action.payload.offsetKey) {
            let currentClip = state.clips.find(clip => clip.id === note.clipID)
            let isGrippedClip = currentClip.id === grippedClip.id
            let destinationClip = isGrippedClip ? targetClip : currentClip

            // Wrap notes around loop limits
            let clipChangeOffsetAdjustment = (currentClip.start + currentClip.offset - targetClip.start - targetClip.offset) % targetClip.loopLength
            let newStart = note.start + action.payload.offsetStart + (isGrippedClip ? clipChangeOffsetAdjustment : 0)
            let loopOverflowAdjustment = isGrippedClip ? clipChangeOffsetAdjustment : 0
            while (newStart < destinationClip.offset) {
              loopOverflowAdjustment += destinationClip.loopLength
              newStart += destinationClip.loopLength
            }
            while (newStart >= destinationClip.offset + destinationClip.loopLength) {
              loopOverflowAdjustment -= destinationClip.loopLength
              newStart -= destinationClip.loopLength
            }

            // Apply changes
            let modifiedNote = u({
              start:  note.start  + action.payload.offsetStart + loopOverflowAdjustment,
              end:    note.end    + action.payload.offsetEnd   + loopOverflowAdjustment,
              keyNum: note.keyNum + action.payload.offsetKey,
              clipID: destinationClip.id,
            }, note)

            // Copy - retain original AND yield new modified note
            if (copyNotes) {
              modifiedNote = u({
                id: noteAutoIncrement,
              }, modifiedNote)
              noteAutoIncrement++
              copiedNotes.push(modifiedNote)
              return note
            }

            // No copy - simply modify the original
            return modifiedNote
          }

          // Resized note - render as selected
          return u({
            start:  note.start  + action.payload.offsetStart,
            end:    note.end    + action.payload.offsetEnd,
          }, note)
        }
        return note
      }, state.notes)

      // Copies created - append and return
      if (copiedNotes.length)
        finalizedNotes = mappedNotes.concat(copiedNotes)
      // No copies - simply return
      else
        finalizedNotes = mappedNotes

      return u({
        notes: finalizedNotes,
        noteLengthLast: newNoteLength,
        noteAutoIncrement,
      }, state)
    }

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
        name: action.name || 'MIDI Track '+(state.trackAutoIncrement + 1),
        color: TRACK_COLORS[state.colorAutoIncrement%TRACK_COLORS.length],
        arm:  false,
        mute: false,
        solo: false
      }
    ),
    trackAutoIncrement: state.trackAutoIncrement + 1,
    colorAutoIncrement: state.colorAutoIncrement + 1
  }, state)
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  if (getClipAtBar(state, action.bar, action.trackID))
    return state

  // Create new clip
  let snappedClipStart = action.snapStart ? Math.floor(action.bar) + 0.00 : action.bar
  let newClip = u.freeze({
    id:         state.clipAutoIncrement,
    trackID:    action.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + (action.end || 1.00),
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
      snappedNoteStart = (snappedNoteStart - foundClip.start - foundClip.offset) % foundClip.loopLength

  let newNote = u.freeze({
    id:       state.noteAutoIncrement,
    trackID:  action.trackID,
    clipID:   foundClip.id,
    keyNum:   snappedNoteKey,
    start:    action.start ? action.start - foundClip.start : snappedNoteStart,
    end:      action.end ? action.end - foundClip.start : snappedNoteStart + state.noteLengthLast,
  })

  // Update State
  return u({
    notes: uAppend(newNote),
    noteAutoIncrement: uIncrement(1),
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
