// ============================================================================
// Phrase Tracks
// ============================================================================

import u from 'updeep';
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { phrase } from '../actions/actions.js';

export const defaultState = {
  barCount: 16.00,
  playhead: 0.000,
  tracks: [],
  clips: [],
  notes: [],
  clipSelectionOffsetStart: null,
  clipSelectionOffsetEnd:   null,
  clipSelectionOffsetTrack: null,
  noteSelectionOffsetStart: null,
  noteSelectionOffsetEnd: null,
  noteSelectionOffsetKey: null,
  trackAutoIncrement: 0,
  noteAutoIncrement:  0,
  clipAutoIncrement:  0,
  noteLengthLast: 0.25
};

const MINIMUM_NOTE_LENGTH = 0.0078125

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
    case phrase.DELETE_CLIP:
      return u({
        clips: u.reject(x => x.id == action.clipID)
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DRAG_CLIP_SELECTION:
      var offsetStart = action.start
      var offsetEnd   = action.end
      var targetClip = state.clips.find(clip => clip.id == action.clipID)
      var gridUnit = 0.125
      var selectedClips = state.clips.filter(clip => clip.selected)

      // Snap drag offset to closest grid lines
      var [snappedOffsetStart, snappedOffsetEnd]
        = action.snap 
        ? snapNoteOffset(offsetStart, offsetEnd, targetClip, gridUnit)
        : [offsetStart, offsetEnd]

      // Avoid negative clip lengths!
      var [finalOffsetStart, finalOffsetEnd] = enforcePositiveNoteLengths(snappedOffsetStart, snappedOffsetEnd, selectedClips)

      return u({
        clipSelectionOffsetStart: finalOffsetStart,
        clipSelectionOffsetEnd:   finalOffsetEnd
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DRAG_NOTE_SELECTION:
      var offsetStart = action.start
      var offsetEnd   = action.end
      var targetNote = state.notes.find(note => note.id == action.noteID)
      var gridUnit = 0.125
      var selectedNotes = state.notes.filter(note => note.selected)

      // Snap drag offset to closest grid lines
      var [snappedOffsetStart, snappedOffsetEnd]
        = action.snap 
        ? snapNoteOffset(offsetStart, offsetEnd, targetNote, gridUnit)
        : [offsetStart, offsetEnd]

      // Avoid negative note lengths!
      var [finalOffsetStart, finalOffsetEnd] = enforcePositiveNoteLengths(snappedOffsetStart, snappedOffsetEnd, selectedNotes)

      return u({
        noteSelectionOffsetStart: finalOffsetStart,
        noteSelectionOffsetEnd:   finalOffsetEnd,
        noteSelectionOffsetKey:   Math.round( action.key )
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        clips: clips => {
          return clips.map(clip => {
            if (clip.selected) {
              return u({
                start:  clip.start  + state.clipSelectionOffsetStart,
                end:    clip.end    + state.clipSelectionOffsetEnd,
              }, clip)
            } else {
              return clip
            }
          })
        },
        clipSelectionOffsetStart: null,
        clipSelectionOffsetEnd:   null,
        clipSelectionOffsetTrack: null
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION:
      return u({
        notes: notes => {
          return notes.map(note => {
            if (note.selected) {
              return u({
                start:  note.start  + state.noteSelectionOffsetStart,
                end:    note.end    + state.noteSelectionOffsetEnd,
                keyNum: note.keyNum + state.noteSelectionOffsetKey
              }, note)
            } else {
              return note
            }
          })
        },
        noteSelectionOffsetStart: null,
        noteSelectionOffsetEnd:   null,
        noteSelectionOffsetKey:   null
      }, state)

    // ------------------------------------------------------------------------
    case phrase.MOVE_PLAYHEAD:
      var playhead = Math.max(action.bar, 0)
          playhead = Math.min(playhead, state.barCount)
      return u({
        playhead: playhead
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

// Works for both notes and clips
function snapNoteOffset(offsetStart, offsetEnd, note, snapUnit = 0.125) {
  // --------------------------------------------------------------------------
  // Moving the whole note
  // --------------------------------------------------------------------------
  // Snap both the start and end by the same amount, based on either the 
  // starting point or the ending point of the note - which ever snaps closer
  if (offsetStart == offsetEnd) {
    var snappedClosestGridLineStart = snapValueToClosestGridLine(snapUnit, offsetStart, note.start)
    var snappedClosestGridLineEnd   = snapValueToClosestGridLine(snapUnit, offsetStart, note.end)
    var snappedClosestUnitAway      = snapValueToClosestUnitAway(snapUnit, offsetStart)
    var snappings = [snappedClosestGridLineStart, snappedClosestGridLineEnd, snappedClosestUnitAway]
    var [closestSnap, closestSnapDistance] = snappings
      .map(snapping => [snapping, Math.abs(snapping - offsetStart)])
      .sort((a, b) => a[1] - b[1])
      [0]

    // Don't do any snapping if we aren't at least 20% within range
    if (closestSnapDistance > 0.20*snapUnit)
      return [offsetStart, offsetStart]

    // Return closest snap
    return [closestSnap, closestSnap]
  }

  // --------------------------------------------------------------------------
  // Dragging one end of the note
  // --------------------------------------------------------------------------
  // Snap either individual end of the note
  if (offsetStart) {
    let snappedOffset = snapValueToBestFit(snapUnit, offsetStart, note.start)
    return [snappedOffset, 0]
  }
  if (offsetEnd) {
    let snappedOffset = snapValueToBestFit(snapUnit, offsetEnd, note.end)
    return [0, snappedOffset]
  }
}

function snapValueToClosestUnitAway(snapUnit, offset) {
  return Math.round( offset  / snapUnit ) * snapUnit
}
function snapValueToClosestGridLine(snapUnit, offset, originalValue) {
  return Math.round( (originalValue + offset) / snapUnit ) * snapUnit - originalValue
}
function snapValueToBestFit(snapUnit, offset, originalValue) {
  // Snap an individual grip either to the next unit distance or to the closest grid line,
  // Whichever fits best.
  var snappedOffsetToClosestUnitAway = snapValueToClosestGridLine(snapUnit, offset, originalValue)
  var snappedOffsetToClosestGridLine = snapValueToClosestUnitAway(snapUnit, offset)

  var snapAmountUnitAway = Math.abs( snappedOffsetToClosestUnitAway - offset )
  var snapAmountGridLine = Math.abs( snappedOffsetToClosestGridLine - offset )

  // Don't do any snapping if we aren't at least within 20% within range
  if (snapAmountUnitAway > 0.20*snapUnit && snapAmountGridLine > 0.25*snapUnit)
    return offset
  // Snap to the closest 1 unit delta
  if( snapAmountUnitAway < snapAmountGridLine )
    return snappedOffsetToClosestUnitAway
  // Snap to the closest gridline
  else
    return snappedOffsetToClosestGridLine
}

// Works for both notes and clips
function enforcePositiveNoteLengths(offsetStart, offsetEnd, selectedNotes) {
  var adjustment = 0
  var proposedLengthChange = offsetEnd - offsetStart
  if (proposedLengthChange < 0) {
    var shortestNoteLength = selectedNotes
      .reduce((shortestLength, note) => {
        return Math.min(shortestLength, note.end - note.start)
      }, 12345678) // Really long dummy number
    adjustment = Math.min(0, shortestNoteLength + proposedLengthChange - MINIMUM_NOTE_LENGTH)
  }
  offsetStart = offsetStart ? (offsetStart + adjustment) : offsetStart
  offsetEnd   = offsetEnd   ? (offsetEnd   - adjustment) : offsetEnd
  return [offsetStart, offsetEnd]
}
