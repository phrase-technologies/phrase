import { createSelector } from 'reselect';

const defaultSelector = state => state.pianoroll
const clipsSelector = state => state.pianoroll.clips

export const allTrackNotesSelector = createSelector(
  clipsSelector,
  (clips) => {
    var renderedTrackNotes = []
    clips.forEach(clip => {
      renderedTrackNotes.push(...renderClipNotes(clip))
    })
    return renderedTrackNotes
  }
)

export const pianorollSelector = createSelector(
  defaultSelector,
  allTrackNotesSelector,
  (state, notes) => {
    return {
      ...state,
      notes
    }
  }
)

// A clip might be looped for multiple iterations, some full, some partial.
// Render the clip's notes into the correct positions for each iteration.
export function renderClipNotes(clip) {
  var renderedClipNotes = []

  // Loop Iterations
  var currentLoopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
  var currentLoopStartCutoff = clip.start - currentLoopStart                      // Used to check if a note is cut off at the beginning of the current loop iteration
  var currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
  while( currentLoopStart < clip.end ) {
    clip.notes.forEach((note) => {

      // Notes that are entirely out of view - skip them
      if (note.end < currentLoopStartCutoff || note.start > currentLoopEndCutoff)
        return

      // Extrapolate the note to the current loop iteration
      let renderedNote = Object.assign({}, note, {
        start: currentLoopStart + note.start,
        end:   currentLoopStart + note.end
      })

      // Notes that are cut off at the beginning
      if (note.start < currentLoopStartCutoff)
      {
        renderedNote.start = currentLoopStart + currentLoopStartCutoff
        renderedNote.outOfView = true
      }

      // Notes that are cut off at the end
      if (note.end > currentLoopEndCutoff)
        renderedNote.end = currentLoopStart + currentLoopEndCutoff

      renderedClipNotes.push(renderedNote)
    })

    // Next iteration
    currentLoopStart += clip.loopLength
    currentLoopStartCutoff = 0
    currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
  }

  return renderedClipNotes
}