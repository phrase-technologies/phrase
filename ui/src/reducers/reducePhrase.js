import _ from 'lodash'
import u from 'updeep'
import { api } from 'helpers/ajaxHelpers'
import {
  uIncrement,
  uAppend,
  uRemove,
  uReplace,
} from 'helpers/arrayHelpers'

import { phrase, mixer, mouse } from 'actions/actions'

import {
  currentNotesSelector,
  clipSelectionOffsetValidated,
  noteSelectionOffsetValidated,
} from 'selectors/selectorPianoroll'

import { phraseMidiSelector } from 'selectors/selectorTransport'
import { arrangeToolSelect } from 'reducers/reduceArrangeTool'

import {
  getOffsetedTrackID,
  getTracksHeight,
} from 'helpers/trackHelpers'

import { negativeModulus } from 'helpers/intervalHelpers'
import { push } from 'react-router-redux'
import { librarySaveNew } from 'reducers/reduceLibrary'
import { ActionCreators as UndoActions } from 'redux-undo'

import { catchAndToastException } from 'reducers/reduceNotification'

// ============================================================================
// Phrase Action Creators
// ============================================================================
export const phraseRename = (name) => ({ type: phrase.RENAME, name })
export const phraseCreateTrack = (actionConfig) => {
  return (dispatch, getState) => {
    dispatch({ type: phrase.CREATE_TRACK, ...actionConfig })
    if (actionConfig.trackType === "AUDIO") {
      dispatch(arrangeToolSelect(`pointer`))
    } else {
      dispatch(arrangeToolSelect(`pencil`))
    }

    // Take measurements after the new track is created, adjust height
    let state = getState()
    let mixerContentHeight = getTracksHeight(state.phrase.present.tracks)
    let height = state.mixer.height
    dispatch({ type: mixer.RESIZE_HEIGHT, height, mixerContentHeight })
  }
}

export const phraseMuteTrack = (trackID) => ({type: phrase.MUTE_TRACK, trackID})
export const phraseSoloTrack = (trackID) => ({type: phrase.SOLO_TRACK, trackID})
export const phraseSetTempo = (tempo) => ({type: phrase.SET_TEMPO, tempo})

export const phraseCreateClip = ({
  trackID,
  start,
  length,
  snapStart = true,
  ignore,
  newRecording,
  recordingTargetClipID,
  audioUrl,
}) => {
  return async (dispatch, getState, { ENGINE }) => {
    // Load the corresponding audio file (if audio)
    let result
    if (audioUrl) {
      result = await ENGINE.loadSample(audioUrl)
    }

    let finalLength = audioUrl ? result.duration : length
    let phraseLength = getState().phrase.present.barCount
    if (start + finalLength >= phraseLength) {
      dispatch({
        type: phrase.CHANGE_PHRASE_LENGTH,
        payload: { barCount: start + finalLength }
      })
    }

    dispatch({
      type: phrase.CREATE_CLIP,
      payload: {
        trackID,
        audioUrl,
        start,
        length: finalLength,
        loopLength: finalLength,
        snapStart,
        newRecording,
        recordingTargetClipID,
      },
      ignore,
    })

    // Select the clip after it's created
    let state = getState()
    let clips = state.phrase.present.clips
    let newClip = clips[clips.length - 1]
    if (!newClip)
      return
    dispatch({ type: phrase.SELECT_CLIP, payload: { clipID: newClip.id, union: false }, ignore })
  }
}

export const phraseCreateMidiEvent = ({
  trackID, clipID, bar, type, key, velocity, ignore
}) => ({
  type: phrase.CREATE_MIDI_EVENT,
  payload: { trackID, clipID, bar, type, key, velocity },
  ignore
})

export const phraseCreateNote = ({
  targetClipID, trackID, key, start, end, velocity, ignore, snapStart = true
}) => {
  return (dispatch, getState) => {
    dispatch({
      type: phrase.CREATE_NOTE,
      payload: {
        targetClipID,
        trackID,
        key,
        start,
        end,
        velocity,
        snapStart
      },
      ignore,
    })

    // Select the note after it's created, but NOT if it's an ignored middle step
    // of a large operation (e.g. slice or record)
    if (!ignore) {
      let state = getState()
      let notes = state.phrase.present.notes

      // Can't select if no notes created (attempted note creation at t < 0)
      if (!notes.length) return

      let newNoteID = notes[notes.length - 1].id
      let renderedNotes = currentNotesSelector(state)
      let newNoteLoopIterations = renderedNotes.filter(note => note.id === newNoteID)
      let targetRenderedNote = newNoteLoopIterations.find(note => note.start <= start && note.end > start)

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
}

export const phraseSelectTrack = ({ trackID, union }) => {
  return (dispatch, getState) => {
    let phraseState = getState().phrase.present

    dispatch({
      type: phrase.SELECT_TRACK,
      payload: {
        trackID,
        union,
        tracks: phraseState.tracks,
        clips: phraseState.clips,
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

export const phraseSelectAll = () => {
  return (dispatch, getState) => {
    let {
      phrase: {
        present: {
          notes
        }
      },
      pianoroll: {
        currentTrack: currentTrackId,
      },
    } = getState()
    dispatch({
      type: phrase.SELECT_ALL,
      payload: { notes, currentTrackId },
    })
  }
}

export const phraseDeleteSelection = () => {
  // We need to know the selection - use a thunk to access other state branches
  return (dispatch, getState) => {
    let {
      phrase: {
        present: {
          tracks,
        },
      },
      phraseMeta: {
        selectionType,
        trackSelectionID,
        clipSelectionIDs,
        noteSelectionIDs,
      },
    } = getState()

    // If clip selection was just deleted, delete selected tracks instead
    if (selectionType === "clips" && clipSelectionIDs.length === 0) {
      selectionType = "tracks"
    }

    dispatch({
      type: phrase.DELETE_SELECTION,
      payload: {
        selectionType,
        trackSelectionID,
        clipSelectionIDs,
        noteSelectionIDs,
        currentTrack: (selectionType === "tracks") ? getState().pianoroll.currentTrack : null,
        trackIDs: tracks.map(track => track.id),
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

    if (bar >= foundClip.end || bar <= foundClip.start) return

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
    dispatch(phraseCreateClip({ trackID, start: leftClip.start, length: leftClip.end - leftClip.start, snapStart, ignore }))

    // If no notes in sliced clip, do not ignore last clip creation
    ignore = notes.length > 0

    dispatch(phraseCreateClip({ trackID, start: rightClip.start, length: rightClip.end - rightClip.start, snapStart, ignore }))

    notes.forEach((note, i) => {
      let ignore = i < notes.length - 1
      dispatch(phraseCreateNote({
        trackID,
        key: note.keyNum,
        start: note.start,
        end: note.end,
        ignore,
        snapStart: false,
      }))
    })
  }
}

export const phraseSliceNote = ({ bar, trackID, noteID, snap = 8 }) => {
  return (dispatch, getState) => {
    let state = getState()

    let foundNote = phraseMidiSelector(state).find(x =>
      x.type === `addNoteOn` && x.id === noteID
    )

    bar = Math.round(bar * snap) / snap

    if (bar >= foundNote.end || bar <= foundNote.start) return

    dispatch({ type: phrase.DELETE_NOTE, noteID, ignore: true })
    dispatch(phraseCreateNote(trackID, foundNote.start, foundNote.keyNum, foundNote.start, bar, true))
    dispatch(phraseCreateNote(trackID, bar, foundNote.keyNum, bar, foundNote.end, false))
  }
}

export const phraseDragNoteVelocity = ({ noteID, targetBar, delta, nextVelocity }) => {
  return (dispatch, getState) => {
    let state = getState()
    let currentNotes = currentNotesSelector(state)
    let selectedNotes = currentNotes.filter(x => x.selected)
    let noteToChange = selectedNotes.find(x => x.id === noteID)

    let velocity = nextVelocity
      ? Math.max(1, Math.min(nextVelocity, 127))
      : Math.max(1, Math.min(noteToChange.velocity - delta, 127))

    let velocities =
      selectedNotes.map(note => ({
        id: note.id,
        velocity: nextVelocity
          ? Math.max(1, Math.min(nextVelocity, 127))
          : Math.max(1, Math.min(note.velocity - delta, 127))
      }))

    dispatch({
      type: mouse.TOGGLE_TOOLTIP,
      payload: {
        text: `Velocity: ${velocity}`
      }
    })

    dispatch({
      type: phrase.DRAG_NOTE_VELOCITY,
      payload: {
        grippedNoteID: noteID,
        targetBar,
        velocities
      }
    })
  }
}

export const phraseDropNoteVelocity = () => {
  return (dispatch, getState) => {
    let state = getState()
    let currentNotes = currentNotesSelector(state)

    dispatch({ type: mouse.TOGGLE_TOOLTIP, payload: null })

    dispatch({
      type: phrase.CHANGE_NOTE_VELOCITY,
      payload: { currentNotes }
    })
  }
}

export const phraseQuantizeSelection = () => {
  return (dispatch, getState) => {
    let {
      phraseMeta: {
        selectionType,
        noteSelectionIDs,
      },
      quantizer: {
        division,
      }
    } = getState()
    if (selectionType === 'notes')
      dispatch({
        type: phrase.QUANTIZE_SELECTION,
        payload: {
          noteIDs: Object.keys(noteSelectionIDs),
          division,
        },
      })
  }
}

export const phraseLoadFromMemory = (payload) => {
  return (dispatch) => {
    dispatch({ type: phrase.LOAD_START })
    dispatch(phraseLoadFinish({ loadedPhrase: payload }))
  }
}

export const phraseNotFound = () => ({ type: phrase.NOT_FOUND })

export const phraseLoadFromDb = phraseId => {
  return async (dispatch) => {
    dispatch({ type: phrase.LOAD_START })
    catchAndToastException({ dispatch, toCatch: async () => {
      let { loadedPhrase, message } = await api({
        endpoint: `loadOne`,
        body: { phraseId },
      })

      if (loadedPhrase) {
        dispatch(phraseLoadFinish({ loadedPhrase }))
      } else if (message === `Phrase not found!`) {
        dispatch(phraseNotFound())
      }

    }})
  }
}

export const phraseLoadFinish = ({
  loadedPhrase,
  ignoreAutosave = false,
  retainNoteSelection = false,
}) => {
  return async (dispatch, getState, { ENGINE }) => {
    for (let i in loadedPhrase.state.present.clips) {
      let clip = loadedPhrase.state.present.clips[i]
      if (clip.audioUrl) {
        await ENGINE.loadSample(clip.audioUrl)
      }
    }

    dispatch({
      type: phrase.LOAD_FINISH,
      ignoreAutosave,
      retainNoteSelection,
      payload: {
        ...loadedPhrase,
        name: loadedPhrase.phrasename, // should probably make these the same
      }
    })
  }
}

export const phraseSave = () => {
  return (dispatch, getState) => {
    let state = getState()
    dispatch({ type: phrase.SAVE_START  })
    catchAndToastException({
      dispatch,
      toCatch: async () => {
        await api({
          endpoint: `update`,
          body: {
            phraseId: state.phraseMeta.phraseId,
            phraseName: state.phraseMeta.phraseName,
            phraseState: state.phrase,
          },
        })
        dispatch({ type: phrase.SAVE_FINISH, payload: { timestamp: Date.now() } })
      },
      callback: () => dispatch({ type: phrase.SAVE_FAIL })
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

export const phraseUpdatePluginConfig = (trackID, rackIndex, config) => ({
  type: phrase.UPDATE_PLUGIN_CONFIG, trackID, rackIndex, payload: { config }
})

export const phraseChangeInstrument = (trackID, instrument) => ({
  type: phrase.UPDATE_RACK, trackID, payload: { instrument }
})

// ============================================================================
// Phrase Reducer
// ============================================================================
const TRACK_COLORS = [
  '#0DD',
  '#48F',
  '#88F',
  '#A6E',
  '#D6D',
  '#F4A',
  '#F53',
  '#F80',
  '#FC0',
  '#8D0',
  '#0C0',
  '#0C8',
]

export const defaultState = {
  barCount: 16.00,
  tempo: 120,
  tracks: [],
  clips: [],
  notes: [],
  midiEvents: [],
  trackAutoIncrement: 0,
  colorAutoIncrement: 0,
  noteAutoIncrement:  0,
  clipAutoIncrement:  0,
  noteLengthLast: 0.25,
}

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.CREATE_TRACK:
      return reduceCreateTrack(state, action)

    // ------------------------------------------------------------------------
    case phrase.CHANGE_PHRASE_LENGTH:
      return u({
        barCount: action.payload.barCount,
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
    case phrase.UPDATE_PLUGIN_CONFIG:
      return u({
        tracks: u.updateIn(['*'], u.if(
          (track) => track.id === action.trackID,
          (track) => {

            // TODO: use updeep better here to update inner array item

            let rack = [
              ...track.rack.slice(0, action.rackIndex),
              {
                ...track.rack[action.rackIndex],
                config: action.payload.config
              },
              ...track.rack.slice(action.rackIndex + 1, Infinity)
            ]

            return u({ rack }, track)
          }
        ))
      }, state)

    // ------------------------------------------------------------------------
    case phrase.UPDATE_RACK:
      return u({
        tracks: u.updateIn(['*'], u.if(
          (track) => track.id === action.trackID,
          (track) => u({rack: [action.payload.instrument]}, track)
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
    case phrase.CREATE_MIDI_EVENT:
      return {
        ...state,
        midiEvents: [
          ...state.midiEvents,
          action.payload,
        ]
      }

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
    case phrase.CONSOLIDATE_CLIP:
      let foundClip = state.clips.find(clip => clip.id === action.clipID)
      if (!foundClip)
        return state

      // Consolidate if notes are found
      let consolidatedClip = u({ recording: undefined }, foundClip)
      return u({
        clips: uReplace(foundClip, consolidatedClip),
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      let {
        selectionType,
        trackSelectionID,
        clipSelectionIDs,
        noteSelectionIDs,
      } = action.payload
      if (selectionType === "tracks") {
        // Can not delete last track! (Until we launch multitrack: TODO)
        if (state.tracks.length <= 1)
          return state

        let trackToRemove = state.tracks.find(track => track.id === action.payload.trackSelectionID)
        return u({
          tracks: trackToRemove ? uRemove(trackToRemove) : state.tracks,
          clips: u.reject(clip => trackSelectionID === clip.trackID),
          notes: u.reject(note => trackSelectionID === note.trackID)
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

          // No copy - simply modify the original clip
          // Move it's notes to the new track if necessary
          mappedNotes = u.map(note => {
            return (note.clipID === clip.id)
              ? u({ trackID: newTrackID }, note)
              : note
          }, mappedNotes)
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
      let targetClip = _.findLast(state.clips, clip => clip.trackID === grippedNote.trackID && clip.start <= action.payload.targetBar && clip.end > action.payload.targetBar) || grippedClip
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
    case phrase.CHANGE_NOTE_VELOCITY:
      let { currentNotes } = action.payload

      return {
        ...state,
        notes: state.notes.map(note => {
          let currentNote = currentNotes.find(x => x.id === note.id)

          return {
            ...note,
            velocity: currentNote ? currentNote.velocity : note.velocity
          }
        })
      }

    // ------------------------------------------------------------------------
    case phrase.QUANTIZE_SELECTION:
      let { noteIDs, division } = action.payload
      return {
        ...state,
        notes: state.notes.map(note => {
          let start = note.start
          let end = note.end
          let length = note.end - note.start
          if (noteIDs.find(noteID => { return +noteID === note.id })) {
            start = Math.round(note.start / division) * division
            end = start + length
          }
          return {
            ...note,
            start,
            end,
          }
        })
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
  let type = action.trackType || 'MIDI'
  let DEFAULT_RACK

  if (type === 'MIDI') {
    let DEFAULT_INSTRUMENT = {
      id: `Piano`,
      config: {
        // polyphony: 32,
        // oscillatorType: `square`
      }
    }

    DEFAULT_RACK = [
      DEFAULT_INSTRUMENT,
    ]
  } else {
    let AUDIO_LINE_IN = {
      id: `Audio`,
      config: {},
    }

    DEFAULT_RACK = [
      AUDIO_LINE_IN,
    ]
  }

  return u({
    tracks: uAppend(
      {
        id: state.trackAutoIncrement,
        type,
        name: action.name || `${type} Track ${state.trackAutoIncrement + 1}`,
        color: TRACK_COLORS[state.colorAutoIncrement%TRACK_COLORS.length],
        rack: action.rack || DEFAULT_RACK,
        mute: false,
        solo: false
      }
    ),
    tempo: type === 'MIDI' ? state.tempo : 240,
    trackAutoIncrement: state.trackAutoIncrement + 1,
    colorAutoIncrement: state.colorAutoIncrement + 1
  }, state)
}

function reduceCreateClip(state, action) {
  // Cannot create negative length clips
  if (action.payload.length && action.payload.length < 0)
    return state

  // Cannot create clips in negative time region
  if (action.payload.start < 0)
    return state

  // Skip if clip already exists
  if (!action.payload.newRecording && getClipAtBar(state, action.payload.start, action.payload.trackID))
    return state

  // Cannot create notes in audio tracks, ignore
  let foundTrack = state.tracks.find(track => track.id === action.payload.trackID)
  if (foundTrack.type === "AUDIO" && !action.payload.audioUrl)
    return state

  // Create new clip
  let snappedClipStart = action.payload.snapStart ? Math.floor(action.payload.start) + 0.00 : action.payload.start
  let newClip = u.freeze({
    id:         state.clipAutoIncrement,
    type:       foundTrack.type,
    trackID:    action.payload.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + (action.payload.length || 1.00),
    offset:     0.00,
    loopLength: action.payload.loopLength || 1.00,
    recording:  action.payload.newRecording,
    audioUrl:   action.payload.audioUrl,
  })

  // Insert
  return u({
    clips: uAppend(newClip),
    clipAutoIncrement: uIncrement(1)
  }, state)
}

function reduceCreateNote(state, action) {
  // Cannot create negative length notes
  if (action.payload.end && action.payload.end < 0)
    return state

  // Cannot create notes in negative time region
  if (action.payload.start < 0)
    return state

  // Which clip should we create the note in?
  let foundClip
  if (Number.isInteger(action.payload.targetClipID)) {
    foundClip = state.clips.find(clip => clip.id === action.payload.targetClipID)
    // Extend the clip if necessary
    if (action.payload.end > foundClip.end) {
      let extendedClip = u({
        end: Math.ceil(action.payload.end),
        loopLength: Math.ceil(action.payload.end) - foundClip.start,
      }, foundClip)
      state = u({ clips: uReplace(foundClip, extendedClip) }, state)
    }
  }
  // Create clip if necessary
  else {
    state = reduceCreateClip(state, action)
    foundClip = getClipAtBar(state, action.payload.start, action.payload.trackID)
  }

  // Cannot create notes in audio tracks, ignore
  if (!foundClip)
    return state
  let foundTrack = state.tracks.find(track => track.id === foundClip.trackID)
  if (foundTrack.type === "AUDIO")
    return state

  // Insert note, snap to same length as most previously created note
  let snapGrid = 0.125 // TODO: Make this adjust based on zoom
  let snappedNoteKey   = Math.ceil(action.payload.key)
  let snappedNoteStart = Math.floor(action.payload.start/snapGrid) * snapGrid
      snappedNoteStart = (snappedNoteStart - foundClip.start - foundClip.offset) % foundClip.loopLength

  let newNote = u.freeze({
    id:       state.noteAutoIncrement,
    trackID:  foundClip.trackID,
    clipID:   foundClip.id,
    keyNum:   snappedNoteKey,
    start:    action.payload.snapStart ? snappedNoteStart : action.payload.start - foundClip.start,
    end:      action.payload.end ? action.payload.end - foundClip.start : snappedNoteStart + state.noteLengthLast,
    velocity: action.payload.velocity || 127,
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
