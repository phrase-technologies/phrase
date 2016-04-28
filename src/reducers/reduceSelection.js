import u from 'updeep'
import { uIncrement, uAppend } from '../helpers/arrayHelpers.js'

import { phrase } from '../actions/actions.js'

// ============================================================================
// Selection Reducer
// ============================================================================
export const defaultState = {
  clipSelectionIDs: [],
  clipSelectionTargetID: null,
  clipSelectionOffsetStart: null,
  clipSelectionOffsetEnd:   null,
  clipSelectionOffsetTrack: null,
  clipSelectionOffsetLooped: false,
  clipSelectionOffsetSnap: true,
  noteSelectionIDs: [],
  noteSelectionTargetID: null,
  noteSelectionOffsetStart: null,
  noteSelectionOffsetEnd: null,
  noteSelectionOffsetKey: null,
  noteSelectionOffsetSnap: true,
}

export default function reducePhrase(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case phrase.DRAG_CLIP_SELECTION: {
      return u({
        clipSelectionTargetID: action.clipID,
        clipSelectionOffsetStart: action.start,
        clipSelectionOffsetEnd: action.end,
        clipSelectionOffsetTrack: action.track,
        clipSelectionOffsetLooped: action.looped,
        clipSelectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DRAG_NOTE_SELECTION: {
      return u({
        noteSelectionTargetID: action.noteID,
        noteSelectionOffsetStart: action.start,
        noteSelectionOffsetEnd: action.end,
        noteSelectionOffsetKey: action.key,
        noteSelectionOffsetSnap: action.snap,
      }, state)
    }

    // ------------------------------------------------------------------------
    case phrase.DROP_CLIP_SELECTION:
      return u({
        clipSelectionTargetID: null,
        clipSelectionOffsetStart: null,
        clipSelectionOffsetEnd: null,
        clipSelectionOffsetTrack: null,
        clipSelectionOffsetLooped: false,
        clipSelectionOffsetSnap: true,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DROP_NOTE_SELECTION:
      return u({
        noteSelectionTargetID: null,
        noteSelectionOffsetStart: null,
        noteSelectionOffsetEnd: null,
        noteSelectionOffsetKey: null,
        noteSelectionOffsetSnap: true,
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

// Works for both notes and clips
function snapNoteOffset(offsetStart, offsetEnd, note, snapUnit = 0.125) {
  // --------------------------------------------------------------------------
  // Moving the whole note
  // --------------------------------------------------------------------------
  // Snap both the start and end by the same amount, based on either the
  // starting point or the ending point of the note - which ever snaps closer
  if (offsetStart === offsetEnd) {
    let snappedClosestGridLineStart = snapValueToClosestGridLine(snapUnit, offsetStart, note.start)
    let snappedClosestGridLineEnd   = snapValueToClosestGridLine(snapUnit, offsetStart, note.end)
    let snappedClosestUnitAway      = snapValueToClosestUnitAway(snapUnit, offsetStart)
    let snappings = [snappedClosestGridLineStart, snappedClosestGridLineEnd, snappedClosestUnitAway]
    let [closestSnap, closestSnapDistance] = snappings
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
  return Math.round(offset / snapUnit) * snapUnit
}
function snapValueToClosestGridLine(snapUnit, offset, originalValue) {
  return Math.round((originalValue + offset) / snapUnit) * snapUnit - originalValue
}
function snapValueToBestFit(snapUnit, offset, originalValue) {
  // Snap an individual grip either to the next unit distance or to the closest grid line,
  // Whichever fits best.
  let snappedOffsetToClosestUnitAway = snapValueToClosestGridLine(snapUnit, offset, originalValue)
  let snappedOffsetToClosestGridLine = snapValueToClosestUnitAway(snapUnit, offset)

  let snapAmountUnitAway = Math.abs(snappedOffsetToClosestUnitAway - offset)
  let snapAmountGridLine = Math.abs(snappedOffsetToClosestGridLine - offset)

  // Don't do any snapping if we aren't at least within 20% within range
  if (snapAmountUnitAway > 0.20*snapUnit && snapAmountGridLine > 0.25*snapUnit)
    return offset
  // Snap to the closest 1 unit delta
  if (snapAmountUnitAway < snapAmountGridLine)
    return snappedOffsetToClosestUnitAway
  // Snap to the closest gridline
  return snappedOffsetToClosestGridLine
}
