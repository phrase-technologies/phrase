import _ from 'lodash'
import { createSelector } from 'reselect'
import { createLargeCacheSelector } from '../helpers/arrayHelpers.js'
import { negativeModulus } from '../helpers/intervalHelpers.js'

export const MINIMUM_UNIT_LENGTH = 0.0078125

const barCountSelector          = (state) => (state.phrase.present.barCount)
const playheadSelector          = (state) => (state.transport.playhead)
const recordingSelector         = (state) => (state.transport.recording)
const tracksSelector            = (state) => (state.phrase.present.tracks)
const clipsSelector             = (state) => (state.phrase.present.clips)
const notesSelector             = (state) => (state.phrase.present.notes)
const pianorollSelector         = (state) => (state.pianoroll)
const selectionType             = (state) => (state.phraseMeta.selectionType)
const clipSelectionIDs          = (state) => (state.phraseMeta.clipSelectionIDs)
const clipSelectionGrippedID    = (state) => (state.phraseMeta.clipSelectionGrippedID)
const clipSelectionOffsetStart  = (state) => (state.phraseMeta.clipSelectionOffsetStart)
const clipSelectionOffsetEnd    = (state) => (state.phraseMeta.clipSelectionOffsetEnd)
const clipSelectionOffsetTrack  = (state) => (state.phraseMeta.clipSelectionOffsetTrack)
const clipSelectionOffsetLooped = (state) => (state.phraseMeta.clipSelectionOffsetLooped)
const clipSelectionOffsetSnap   = (state) => (state.phraseMeta.clipSelectionOffsetSnap)
const noteSelectionIDs          = (state) => (state.phraseMeta.noteSelectionIDs)
const noteSelectionGrippedID    = (state) => (state.phraseMeta.noteSelectionGrippedID)
const noteSelectionTargetBar    = (state) => (state.phraseMeta.noteSelectionTargetBar)
const noteSelectionOffsetStart  = (state) => (state.phraseMeta.noteSelectionOffsetStart)
const noteSelectionOffsetEnd    = (state) => (state.phraseMeta.noteSelectionOffsetEnd)
const noteSelectionOffsetKey    = (state) => (state.phraseMeta.noteSelectionOffsetKey)
const noteSelectionOffsetSnap   = (state) => (state.phraseMeta.noteSelectionOffsetSnap)

export const clipSelectionOffsetValidated = createSelector(
  clipsSelector,
  selectionType,
  clipSelectionIDs,
  clipSelectionGrippedID,
  clipSelectionOffsetStart,
  clipSelectionOffsetEnd,
  clipSelectionOffsetTrack,
  clipSelectionOffsetLooped,
  clipSelectionOffsetSnap,
  tracksSelector,
  (clips, selectionType, clipSelectionIDs, targetClipID, offsetStart, offsetEnd, offsetTrack, offsetLooped, offsetSnap, tracks) => {
    // Escape if there is no selection or selection offset
    if (selectionType === 'clips') {
      let targetClip = (clips || []).find(clip => clip.id === targetClipID)
      let selectedClips = (clips || []).filter(clip => clipSelectionIDs.some(x => x === clip.id))
      // Escape if there is no selection or selection offset
      if (targetClip && selectedClips) {

        // Snap drag offset to closest grid lines
        let gridUnit = 0.125
        let [snappedOffsetStart, snappedOffsetEnd]
          = offsetSnap
          ? snapNoteOffset(offsetStart, offsetEnd, targetClip, gridUnit)
          : [offsetStart, offsetEnd]

        // Avoid negative clip lengths and positions!
        let [tempoOffsetStart, tempoOffsetEnd] = validateOffsetLengths(snappedOffsetStart, snappedOffsetEnd, selectedClips)
        let [finalOffsetStart, finalOffsetEnd] = validateOffsetPosition(tempoOffsetStart, tempoOffsetEnd, selectedClips)

        // Validate Track Offset
        let finalOffsetTrack = validateTrackOffset(offsetTrack, tracks, selectedClips)

        return {
          offsetStart: finalOffsetStart,
          offsetEnd: finalOffsetEnd,
          offsetTrack: finalOffsetTrack,
          offsetLooped,
        }
      }
    }

    return {
      offsetStart: 0,
      offsetEnd: 0,
      offsetTrack: 0,
      offsetLooped: null
    }
  }
)

export const noteSelectionOffsetValidated = createSelector(
  notesSelector,
  selectionType,
  noteSelectionIDs,
  noteSelectionGrippedID,
  noteSelectionOffsetStart,
  noteSelectionOffsetEnd,
  noteSelectionOffsetKey,
  noteSelectionOffsetSnap,
  (notes, selectionType, noteSelectionIDs, grippedNoteID, offsetStart, offsetEnd, offsetKey, offsetSnap) => {
    let grippedNote = (notes || []).find(note => note.id === grippedNoteID)
    let selectedNotes = (notes || []).filter(note => _.has(noteSelectionIDs, note.id))
    // Escape if there is no selection or selection offset
    if (selectionType !== 'notes' || !grippedNote || !selectedNotes) {
      return {
        offsetStart: 0,
        offsetEnd: 0,
        offsetKey: 0,
      }
    }

    // Snap drag offset to closest grid lines
    let gridUnit = 0.125
    let [snappedOffsetStart, snappedOffsetEnd]
      = offsetSnap
      ? snapNoteOffset(offsetStart, offsetEnd, grippedNote, gridUnit)
      : [offsetStart, offsetEnd]

    // Avoid negative note lengths!
    let [finalOffsetStart, finalOffsetEnd] = validateOffsetLengths(snappedOffsetStart, snappedOffsetEnd, selectedNotes)

    return {
      offsetStart: finalOffsetStart,
      offsetEnd: finalOffsetEnd,
      offsetKey: Math.round(offsetKey)
    }
  }
)
const currentTrackSelector = (state) => {
  return state.phrase.present.tracks.find(track => track.id === state.pianoroll.currentTrack)
}
const currentClipsSelector = createSelector(
  clipsSelector,
  selectionType,
  clipSelectionIDs,
  currentTrackSelector,
  clipSelectionOffsetValidated,
  (clips, selectionType, clipSelectionIDs, currentTrack, { offsetStart, offsetEnd, offsetTrack, offsetLooped }) => {
    // Current Track's Clips
    let currentClips = currentTrack ? clips.filter(clip => clip.trackID === currentTrack.id) : []

    // Escape if nothing selected
    if (selectionType !== 'clips')
      return currentClips

    // Render Offseted Selections
    let clipSelectionOffsetPreview = []
    currentClips = currentClips
      .map(clip => {
        let isClipSelected = clipSelectionIDs.some(x => x === clip.id)
        if (isClipSelected) {
          // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
          let validatedOffsetLooped = offsetLooped || (clip.end - clip.start !== clip.loopLength)

          // Offset clip - generate a duplicate preview with any offset (from drag and drop)
          if ((offsetStart && offsetEnd) || offsetTrack) {
            clipSelectionOffsetPreview.push({
              ...clip,
              start:  clip.start  + offsetStart,
              end:    clip.end    + offsetEnd,
              offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
              loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
              trackID: clip.trackID,// + Math.round(offsetTrack), // Don't show any feedback for yet-to-be-finalized track changes
            })

            // Render the original clip as selected
            return {
              ...clip,
              selected: true,
            }
          }

          // Resized clip - render as selected
          return {
            ...clip,
            start:  clip.start  + offsetStart,
            end:    clip.end    + offsetEnd,
            offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
            loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
            selected: true,
          }
        }
        return clip
      })

    // Render a copy of each clip with their rendered selections appended
    return currentClips
      .concat(clipSelectionOffsetPreview)
  }
)
export const currentNotesSelector = createSelector(
  currentClipsSelector,
  notesSelector,
  selectionType,
  noteSelectionIDs,
  currentTrackSelector,
  noteSelectionGrippedID,
  noteSelectionTargetBar,
  noteSelectionOffsetValidated,
  (currentClips, notes, selectionType, noteSelectionIDs, currentTrack, grippedNoteID, targetBar, { offsetStart, offsetEnd, offsetKey }) => {
    // Escape if pianoroll not open
    if (!currentTrack) return []

    let currentNotes = notes.filter(note => note.trackID === currentTrack.id)
    let grippedNote = Number.isInteger(grippedNoteID) ? currentNotes.find(note => note.id === grippedNoteID) : null
    let grippedClip = Number.isInteger(grippedNoteID) ? currentClips.find(clip => clip.id === grippedNote.clipID) : null
    let targetClip  = Number.isInteger(grippedNoteID) ? _.findLast(currentClips, clip => clip.start <= targetBar && clip.end > targetBar) || grippedClip : null

    // Render selected notes
    let noteSelectionOffsetPreview = []
    if (selectionType === 'notes') {
      currentNotes = currentNotes.map(note => {
        let isNoteSelected = _.has(noteSelectionIDs, note.id)
        if (isNoteSelected) {
          // Offset note - generate a duplicate preview with any offset (from drag and drop)
          if ((offsetStart && offsetEnd) || offsetKey) {
            let currentClip = currentClips.find(clip => clip.id === note.clipID)
            let isGrippedClip = currentClip.id === grippedClip.id
            let destinationClip = isGrippedClip ? targetClip : currentClip

            // Wrap notes around loop limits
            let clipChangeOffsetAdjustment = (currentClip.start + currentClip.offset - targetClip.start - targetClip.offset) % targetClip.loopLength
            let newStart = note.start + offsetStart + (isGrippedClip ? clipChangeOffsetAdjustment : 0)
            let loopOverflowAdjustment = isGrippedClip ? clipChangeOffsetAdjustment : 0
            while (newStart < destinationClip.offset) {
              loopOverflowAdjustment += destinationClip.loopLength
              newStart += destinationClip.loopLength
            }
            while (newStart >= destinationClip.offset + destinationClip.loopLength) {
              loopOverflowAdjustment -= destinationClip.loopLength
              newStart -= destinationClip.loopLength
            }

            // Generate the offseted preview
            noteSelectionOffsetPreview.push({
              ...note,
              start:  note.start  + offsetStart + loopOverflowAdjustment,
              end:    note.end    + offsetEnd   + loopOverflowAdjustment,
              keyNum: Math.round(note.keyNum + offsetKey),
              clipID: isGrippedClip ? destinationClip.id : note.clipID,
            })

            // Render the original note as selected
            return {
              ...note,
              selected: true,
            }
          }

          // Resized note - render as selected
          return {
            ...note,
            start:  note.start  + offsetStart,
            end:    note.end    + offsetEnd,
            selected: true,
          }
        }
        return note
      })
    }

    // Render a copy of each note for each loop iteration of it's respective clip
    return currentNotes
      .concat(noteSelectionOffsetPreview)
      .reduce((allLoopedNotes, note) => {
        let loopedNote = loopedNoteSelector({ note, noteSelectionIDs, clips: currentClips })
        return allLoopedNotes.concat(loopedNote)
      }, [])
  }
)

export const mapPianorollToProps = createSelector(
  pianorollSelector,
  currentTrackSelector,
  currentClipsSelector,
  currentNotesSelector,
  barCountSelector,
  playheadSelector,
  recordingSelector,
  (pianoroll, currentTrack, currentClips, currentNotes, barCount, playhead, recording) => {
    return {
      ...pianoroll,
      currentTrack,
      clips: currentClips,
      notes: currentNotes,
      barCount,
      playhead,
      recording,
    }
  }
)

// A clip might be looped for multiple iterations, some full, some partial.
// Render the clip's notes into the correct positions for each iteration.
export const loopedNoteSelector = createLargeCacheSelector(
  (params) => params.note,
  (params) => params.noteSelectionIDs,
  (params) => params.clips,
  (note, noteSelectionIDs, clips) => {
    let renderedClipNotes = []
    let clip = clips.find(clip => clip.id === note.clipID)
    if (!clip) {
      console.error(`loopedNoteSelector(): clip not found with id ${note.clipID}`, note, clips)
      return []
    }

    // Loop Iterations
    let loopIterationSelections = noteSelectionIDs ? noteSelectionIDs[note.id] : null
    let currentLoopIteration = 0
    let currentLoopStart = clip.start + clip.offset
    let currentLoopStartCutoff = -clip.offset                                           // Used to check if a note is cut off at the beginning of the current loop iteration
    let currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
    while (currentLoopStart < clip.end) {
      // Notes that are entirely out of view - skip them
      if (note.end >= currentLoopStartCutoff && note.start <= currentLoopEndCutoff) {
        // Extrapolate the note to the current loop iteration
        let renderedNote = {
          ...note,
          loopIteration: currentLoopIteration,
          start: currentLoopStart + note.start,
          end:   currentLoopStart + note.end
        }

        // Notes that are cut off at the beginning
        if (note.start < currentLoopStartCutoff) {
          renderedNote.start = currentLoopStart + currentLoopStartCutoff
          renderedNote.outOfViewLeft = true
        }

        // Notes that are cut off at the end
        if (note.end > currentLoopEndCutoff) {
          renderedNote.end = currentLoopStart + currentLoopEndCutoff
          renderedNote.outOfViewRight = true
        }

        if (renderedNote.selected) {
          renderedNote.selected
            = loopIterationSelections.some(i => i === currentLoopIteration)
            ? true
            : "faded"
        }

        renderedClipNotes.push(renderedNote)
      }

      // Next iteration
      currentLoopIteration++
      currentLoopStart += clip.loopLength
      currentLoopStartCutoff = 0
      currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
    }

    return renderedClipNotes
  }
)

// Works for both notes and clips
export function validateOffsetLengths(offsetStart, offsetEnd, selectedClips) {
  let adjustment = 0
  let proposedLengthChange = offsetEnd - offsetStart
  if (proposedLengthChange < 0) {
    let shortestClipLength = selectedClips.reduce((shortestLength, clip) => {
      return Math.min(shortestLength, clip.end - clip.start)
    }, 12345678) // Really long dummy number
    adjustment = Math.min(0, shortestClipLength + proposedLengthChange - MINIMUM_UNIT_LENGTH)
  }
  offsetStart = offsetStart ? (offsetStart + adjustment) : offsetStart
  offsetEnd   = offsetEnd   ? (offsetEnd   - adjustment) : offsetEnd
  return [offsetStart, offsetEnd]
}

export function validateOffsetPosition(offsetStart, offsetEnd, selectedNotes) {
  // Don't do anything if there is no selection
  if (!selectedNotes || !selectedNotes.length) {
    return [offsetStart, offsetEnd]
  }

  // Calculate the limit
  let firstNote = selectedNotes.reduce((earliestNote, note) => {
    return earliestNote.start < note.start ? earliestNote : note
  })
  let largestAllowableOffset = -firstNote.start

  // Drag Entire Note
  if (offsetStart === offsetEnd) {
    return offsetStart < largestAllowableOffset
      ? [largestAllowableOffset, largestAllowableOffset]
      : [offsetStart, offsetEnd]
  }
  // Resize Start/End of Note
  return offsetStart < largestAllowableOffset
    ? [largestAllowableOffset, offsetEnd]
    : [offsetStart, offsetEnd]
}

export function validateTrackOffset(offsetTrack, tracks, selectedClips) {
  // Calculate the largest offset allowable to both top and bottom directions
  let firstTrackWithSelectedClip = tracks.length // Default to largest possible value
  let lastTrackWithSelectedClip  = 0             // Default to smallest possible value
  selectedClips.forEach(clip => {
    let currentTrackPosition = tracks.findIndex(track => track.id === clip.trackID)
    firstTrackWithSelectedClip = Math.min(firstTrackWithSelectedClip,  currentTrackPosition)
    lastTrackWithSelectedClip  = Math.max(lastTrackWithSelectedClip, currentTrackPosition)
  })

  // Validate the target offset is within limits
  let maxTrackOffsetTop    = -firstTrackWithSelectedClip
  let maxTrackOffsetBottom = tracks.length - 1 - lastTrackWithSelectedClip
  return Math.min(Math.max(maxTrackOffsetTop, offsetTrack), maxTrackOffsetBottom)
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
