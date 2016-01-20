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
      name: 'Track 1',
      clips: []
    },
    {
      id: 1,
      name: 'Track 2',
      clips: []
    }
  ],
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
            name: "Track "+(state.trackAutoIncrement+1),
            clips: []
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
      // Deselect all existing notes
      var newState = u.updateIn(
        ['tracks', '*', 'clips', '*', 'notes', '*', 'selected'],
        false,
        state
      )

      // Create Clip first if necessary
      newState = reduceCreateClip(
        newState,
        action
      )
      // Create Note
      return reduceCreateNote(
        newState,
        action
      )

    // ------------------------------------------------------------------------
    case phrase.SELECT_NOTE:
      return u.updateIn(
        ['tracks', '*', 'clips', '*', 'notes', '*'],
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
  var currentTrack = state.tracks.find(track => track.id == action.trackID)

  // Skip if clip already exists
  if (doesClipExistAtBar(currentTrack.clips, action.bar))
    return state

  // Create new clip
  var snappedClipStart = Math.floor(action.bar);
  var newClip = {
    id:         state.clipAutoIncrement,
    start:      snappedClipStart,
    end:        snappedClipStart + 1,
    offset:     0.00,
    loopLength: 1.00,
    notes:      []
  }

  // Insert Clip into Track
  var updatedTrack = u({
    clips: uAppend(newClip, clipSortComparison)
  }, currentTrack)

  // Update Track
  return u({
    tracks: uReplace(currentTrack, updatedTrack),
    clipAutoIncrement: uIncrement(1)
  }, state)
}

function reduceCreateNote(state, action) {
  var currentTrack = state.tracks.find(track => track.id == action.trackID)

  // Skip if no clip available
  var foundClip = doesClipExistAtBar(currentTrack.clips, action.bar)
  if (!foundClip)
    return state

  // Skip if note already exists
  if (doesNoteExistInClip(foundClip, action.key, action.bar))
    return state
  
  // Insert note, snap to same length as most previously created note
  var snappedNoteKey   = Math.floor(action.key)
  var snappedNoteStart = Math.floor(action.bar/state.noteLengthLast) * state.noteLengthLast;
  var newNote = {
    id:     state.noteAutoIncrement,
    keyNum: snappedNoteKey,
    start:  snappedNoteStart - foundClip.start,
    end:    snappedNoteStart - foundClip.start + state.noteLengthLast,
    selected: true
  }

  var updatedClip = u({
    notes: uAppend(newNote, noteSortComparison)
  }, foundClip)

  // Insert Clip into Track
  var updatedTrack = u({
    clips: uReplace(foundClip, updatedClip)
  }, currentTrack)

  // Update Track
  return u({
    tracks: uReplace(currentTrack, updatedTrack),
    noteAutoIncrement: uIncrement(1)
  }, state)
}

function doesClipExistAtBar(clips, bar) {
  return clips.find((clip) => {
    return bar >= clip.start && bar < clip.end
  })
}

function doesNoteExistInClip(clip, key, bar) {
  // Find the loop iteration of this clip that the note would fall into
  var loopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
  while(loopStart + clip.loopLength < bar) {
    loopStart += clip.loopLength
  }

  // Search for existing notes in that loop iteration
  var snappedNoteKey = Math.floor(key)
  return clip.notes.find((note) => {
    return (
      note.keyNum == snappedNoteKey &&
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

