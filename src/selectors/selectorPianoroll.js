import { createSelector } from 'reselect';

const barCountSelector = (state) => {
  return state.phrase.barCount
}
const playheadSelector = (state) => {
  return state.phrase.playhead
}
const tracksSelector = (state) => {
  return state.phrase.tracks
}
const clipsSelector = (state) => {
  return state.phrase.clips
}
const notesSelector = (state) => {
  return state.phrase.notes
}
const pianorollSelector = (state) => {
  return state.pianoroll
}
const currentTrackSelector = (state) => {
  return state.phrase.tracks.find(track => {
    return track.id == state.pianoroll.currentTrack
  })
}
const currentClipsSelector = createSelector(
  clipsSelector,
  currentTrackSelector,
  (clips, currentTrack) => {
    return clips.filter(clip => clip.trackID == currentTrack.id)
  }
)
const currentNotesSelector = createSelector(
  currentClipsSelector,
  notesSelector,
  currentTrackSelector,
  (currentClips, notes, currentTrack) => {
    var currentNotes = notes.filter(note => note.trackID == currentTrack.id)

    // Render a copy of each note for each loop iteration of it's respective clip
    return currentNotes.reduce((allLoopedNotes, note) => {
      var loopedNote = renderClipNotes(note, currentClips)
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
export function renderClipNotes(note, clips) {
  var renderedClipNotes = []
  var clip = clips.find(clip => clip.id == note.clipID)

  // Loop Iterations
  var currentLoopStart = clip.start + clip.offset - (!!clip.offset * clip.loopLength)
  var currentLoopStartCutoff = clip.start - currentLoopStart                      // Used to check if a note is cut off at the beginning of the current loop iteration
  var currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
  while( currentLoopStart < clip.end ) {
    // Notes that are entirely out of view - skip them
    if (note.end < currentLoopStartCutoff || note.start > currentLoopEndCutoff)
      return

    // Extrapolate the note to the current loop iteration
    let renderedNote = Object.assign({}, note, {
      start: currentLoopStart + note.start,
      end:   currentLoopStart + note.end
    })

    // Notes that are cut off at the beginning
    if (note.start < currentLoopStartCutoff) {
      renderedNote.start = currentLoopStart + currentLoopStartCutoff
      renderedNote.outOfView = true
    }

    // Notes that are cut off at the end
    if (note.end > currentLoopEndCutoff)
      renderedNote.end = currentLoopStart + currentLoopEndCutoff

    renderedClipNotes.push(renderedNote)

    // Next iteration
    currentLoopStart += clip.loopLength
    currentLoopStartCutoff = 0
    currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
  }

  return renderedClipNotes
}
