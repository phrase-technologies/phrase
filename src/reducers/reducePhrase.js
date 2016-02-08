// ============================================================================
// Phrase Tracks
// ============================================================================

import u from 'updeep';
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { phrase } from '../actions/actions.js';

export const defaultState = {
  barCount: 64.00,
  playhead: 0.000,
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
  clipSelectionOffsetBar:   null,
  clipSelectionOffsetTrack: null,
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
    case phrase.SELECT_CLIP:
      return u.updateIn(
        ['clips', '*'],
        u.ifElse(
          (clip) => clip.id == action.clipID,
          (clip) => u({selected: (action.union ? !clip.selected : true )}, clip),
          (clip) => u({selected: (action.union ?  clip.selected : false)}, clip)          
        ),
        state
      )

    // ------------------------------------------------------------------------
    case phrase.SELECT_NOTE:
      return u.updateIn(
        ['notes', '*'],
        u.ifElse(
          (note) => note.id == action.noteID,
          (note) => u({selected: (action.union ? !note.selected : true )}, note),
          (note) => u({selected: (action.union ?  note.selected : false)}, note)          
        ),
        state
      )

    // ------------------------------------------------------------------------
    case phrase.DELETE_NOTE:
      return u({
        notes: u.reject(x => x.id == action.noteID)
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DRAG_CLIP_SELECTION:
      return u({
        clipSelectionOffsetBar:   action.bar,
        clipSelectionOffsetTrack: action.track
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state;
  }  
}

function reduceCreateClip(state, action) {
  // Skip if clip already exists
  if (getClipAtBar(state, action.bar, action.trackID))
    return state

  // Deselect all existing clips
  state = u.updateIn(
    ['clips', '*', 'selected'],
    false,
    state
  )

  // Create new clip
  var snappedClipStart = Math.floor(action.bar);
  var newClip = u.freeze({
    id:         state.clipAutoIncrement,
    trackID:    action.trackID,
    start:      snappedClipStart,
    end:        snappedClipStart + 1,
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
  var state = reduceCreateClip(state, action)
  var foundClip = getClipAtBar(state, action.bar, action.trackID)

  // Deselect all existing notes
  state = u.updateIn(
    ['notes', '*', 'selected'],
    false,
    state
  )

  // Insert note, snap to same length as most previously created note
  var snappedNoteKey   = Math.ceil(action.key)
  var snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast;
  var newNote = u.freeze({
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
    return clip.trackID == trackID && bar >= clip.start && bar < clip.end
  })
}

export function getNoteAtKeyBar(state, key, bar, trackID) {
  var snappedNoteKey = Math.ceil(key)
  return state.notes.find(note => {
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

    // Ignore clips the end before or start after this point
    if (bar < clip.start || clip.end <= bar)
      return false

    // Find iteration of the clip's loops that the note would fall into
    var loopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
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

// Comparison function for sorting notes a and b by their start time. Usage: note.sort(noteSortComparison);
function noteSortComparison(a, b) {
  return a.start - b.start;
}

function clipSortComparison(a, b) {
  return a.start - b.start;
}

