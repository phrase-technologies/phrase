import { createSelector } from 'reselect'
import { createLargeCacheSelector } from '../helpers/arrayHelpers.js'
import u from 'updeep';
import { negativeModulus } from '../helpers/intervalHelpers.js'

const barCountSelector          = (state) => ( state.phrase.barCount )
const playheadSelector          = (state) => ( state.phrase.playhead )
const tracksSelector            = (state) => ( state.phrase.tracks )
const clipsSelector             = (state) => ( state.phrase.clips )
const notesSelector             = (state) => ( state.phrase.notes )
const pianorollSelector         = (state) => ( state.pianoroll )
const clipSelectionOffsetStart  = (state) => ( state.phrase.clipSelectionOffsetStart )
const clipSelectionOffsetEnd    = (state) => ( state.phrase.clipSelectionOffsetEnd )
const clipSelectionOffsetLooped = (state) => ( state.phrase.clipSelectionOffsetLooped )
const clipSelectionOffsetTrack  = (state) => ( state.phrase.clipSelectionOffsetTrack )
const noteSelectionOffsetStart  = (state) => ( state.phrase.noteSelectionOffsetStart )
const noteSelectionOffsetEnd    = (state) => ( state.phrase.noteSelectionOffsetEnd )
const noteSelectionOffsetKey    = (state) => ( state.phrase.noteSelectionOffsetKey )
const currentTrackSelector      = (state) => {
  return state.phrase.tracks.find(track => {
    return track.id == state.pianoroll.currentTrack
  })
}
const currentClipsSelector = createSelector(
  clipsSelector,
  currentTrackSelector,
  clipSelectionOffsetStart,
  clipSelectionOffsetEnd,
  clipSelectionOffsetLooped,
  clipSelectionOffsetTrack,
  (clips, currentTrack, offsetStart, offsetEnd, offsetLooped, offsetTrack) => {
    // Current Track's Clips
    var currentClips = clips
      .filter(clip => clip.trackID == currentTrack.id)

    // Render Offseted Selections
    var selectedClipsRendered = []
    if (offsetStart || offsetEnd || offsetTrack) {
      selectedClipsRendered = currentClips
        .filter(clip => clip.selected)
        .map(clip => {
          // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
          var validatedOffsetLooped = offsetLooped || (clip.end - clip.start != clip.loopLength)

          return u.freeze({
            ...clip,
            start:  clip.start  + offsetStart,
            end:    clip.end    + offsetEnd,
            offset: validatedOffsetLooped && offsetStart != offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
            loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
            trackID: clip.trackID,// + Math.round(offsetTrack), // Don't show any feedback for yet-to-be-finalized track changes
            selected: offsetStart && offsetEnd || Math.round(offsetTrack) ? false : true
          })
        })
    }

    // Render a copy of each clip with their rendered selections appended
    return currentClips
      .concat(selectedClipsRendered)
  }
)
export const currentNotesSelector = createSelector(
  currentClipsSelector,
  notesSelector,
  currentTrackSelector,
  noteSelectionOffsetStart,
  noteSelectionOffsetEnd,
  noteSelectionOffsetKey,
  (currentClips, notes, currentTrack, offsetStart, offsetEnd, offsetKey) => {
    var currentNotes = notes
      .filter(note => note.trackID == currentTrack.id)

    var selectedNotesRendered = []
    if (offsetStart || offsetEnd || offsetKey) {
      selectedNotesRendered = currentNotes
      .filter(note => note.selected)
      .map(note => {
        return {
          ...note,
          start:  note.start  + offsetStart,
          end:    note.end    + offsetEnd,
          keyNum: Math.round(note.keyNum + offsetKey),
          selected: offsetStart && offsetEnd || Math.round(offsetKey) ? false : true
        }
      })
    }

    // Render a copy of each note for each loop iteration of it's respective clip
    return currentNotes
      .concat(selectedNotesRendered)
      .reduce((allLoopedNotes, note) => {
        var loopedNote = loopedNoteSelector(note, currentClips)
        return allLoopedNotes.concat( loopedNote )
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
  (pianoroll, currentTrack, currentClips, currentNotes, barCount, playhead) => {
    return {
      ...pianoroll,
      currentTrack: currentTrack,
      clips: currentClips,
      notes: currentNotes,
      barCount: barCount,
      playhead: playhead
    }
  }
)

// A clip might be looped for multiple iterations, some full, some partial.
// Render the clip's notes into the correct positions for each iteration.
export const loopedNoteSelector = createLargeCacheSelector(
  (note, clips) => note,
  (note, clips) => clips,
  (note, clips) => {
    var renderedClipNotes = []
    var clip = clips.find(clip => clip.id == note.clipID)

    // Loop Iterations
    var currentLoopStart = clip.start + clip.offset
    var currentLoopStartCutoff = -clip.offset                                           // Used to check if a note is cut off at the beginning of the current loop iteration
    var currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
    while( currentLoopStart < clip.end ) {
      // Notes that are entirely out of view - skip them
      if (note.end >= currentLoopStartCutoff && note.start <= currentLoopEndCutoff) {
        // Extrapolate the note to the current loop iteration
        let renderedNote = Object.assign({}, note, {
          start: currentLoopStart + note.start,
          end:   currentLoopStart + note.end
        })

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

        renderedClipNotes.push(renderedNote)
      }

      // Next iteration
      currentLoopStart += clip.loopLength
      currentLoopStartCutoff = 0
      currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
    }

    return renderedClipNotes
  }
)
