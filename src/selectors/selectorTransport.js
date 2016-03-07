import { createSelector } from 'reselect'
import { createLargeCacheSelector } from '../helpers/arrayHelpers.js'
import { loopedNoteSelector } from './selectorPianoroll.js'

const tracksSelector = (state) => ( state.phrase.tracks )
const clipsSelector  = (state) => ( state.phrase.clips )
const notesSelector  = (state) => ( state.phrase.notes )
const noteMidiSelector = createLargeCacheSelector(
  note => note,
  (note) => {
    var startCommand = {
      trackID: note.trackID,
      bar: note.start,
      keyNum: note.keyNum,
      velocity: note.velocity || 127
    }
    var endCommand = {
      trackID: note.trackID,
      bar: note.end,
      keyNum: note.keyNum,
      velocity: 0
    }
    return [startCommand, endCommand]
  }
)
export const phraseMidiSelector = createSelector(
  clipsSelector,
  notesSelector,
  (clips, notes) => {
    // Render a copy of each note for each loop iteration of it's respective clip
    var allLoopedNotes = notes
      .reduce((allLoopedNotes, note) => {
        var loopedNote = loopedNoteSelector(note, clips)
        return [...allLoopedNotes, ...loopedNote]
      }, [])

    // Convert each note into a start and stop MIDI command
    var midiCommands = allLoopedNotes
      .reduce((midiCommands, note) => {
        return [...midiCommands, ...noteMidiSelector(note)]
      }, [])
      .sort((a, b) => a.bar - b.bar)

    return midiCommands
  }
)