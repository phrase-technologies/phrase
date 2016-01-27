// ============================================================================
// Phrase Tracks
// ============================================================================

import u from 'updeep';
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { phrase } from '../actions/actions.js';

export const defaultState = {
  tracks: [
    {
      id: 0,
      name: 'Track 1'
    },
    {
      id: 1,
      name: 'Track 2'
    }
  ],
  clips: [],
  notes: [],
  trackAutoIncrement: 2,
  noteAutoIncrement:  0,
  clipAutoIncrement:  0,
  noteLengthLast: 0.25
};

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.CREATE_TRACK:
      return {
        ...state,
        tracks: [
          ...state.tracks,
          {
            id: state.trackAutoIncrement,
            name: action.name || "Track "+(state.trackAutoIncrement+1)
          }
        ],
        trackAutoIncrement: state.trackAutoIncrement+1
      }

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
    case phrase.SELECT_NOTE:
      return u.updateIn(
        ['notes', '*'],
        u.ifElse(
          (note) => note.id == action.noteID,
          (note) => u({selected: true}, note),
          (note) => u({selected: false}, note)          
        ),
        state
      )

    // ------------------------------------------------------------------------
    default:
      return state;
  }  
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  if (getClipAtBar(state, action.trackID, action.bar))
    return state

  // Create new clip
  var snappedClipStart = Math.floor(action.bar);
  var newClip = u.freeze({
    id:         state.clipAutoIncrement,
    trackID:    action.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + 1,
    offset:     0.00,
    loopLength: 1.00
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
  var state = reduceCreateClip(state, action)
  var foundClip = getClipAtBar(state, action.bar, action.trackID)

  // Deselect all existing notes
  state = u.updateIn(
    ['notes', '*', 'selected'],
    false,
    state
  )

  // Insert note, snap to same length as most previously created note
  var snappedNoteKey   = Math.floor(action.key)
  var snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast;
  var newNote = u.freeze({
    id:     state.noteAutoIncrement,
    clipID: foundClip.id,
    keyNum: snappedNoteKey,
    start:  snappedNoteStart - foundClip.start,
    end:    snappedNoteStart - foundClip.start + state.noteLengthLast,
    selected: true
  })

  // Update State
  return u({
    notes: uAppend(newNote),
    noteAutoIncrement: uIncrement(1)
  }, state)
}

function getClipAtBar(state, bar, trackID) {
  return state.clips.find((clip) => {
    return clip.trackID == trackID && bar >= clip.start && bar < clip.end
  })
}

function getNoteAtKeyBar(state, key, bar, trackID) {
  var snappedNoteKey = Math.floor(key)
  state.notes.find(note => {
    // Ignore notes on different keys
    if (note.keyNum != snappedNoteKey)
      return false

    // Find corresponding clip 
    var clip = state.clips.find(clip => {
      return clip.trackID == trackID && clip.id == note.clipID
    })

    // Ignore notes on different tracks
    if (!clip)
      return false

    // Find iteration of the clip's loops that the note would fall into
    var loopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
    while(loopStart + clip.loopLength < bar) {
      loopStart += clip.loopLength
    }

    // Check if note matches
    return (
      bar >= loopStart + note.start &&
      bar <  loopStart + note.end
    )
  })
}

// Comparison function for sorting notes a and b by their start time. Usage: note.sort(noteSortComparison);
function noteSortComparison(a, b) {
  return a.start - b.start;
}

function clipSortComparison(a, b) {
  return a.start - b.start;
}

