import { createSelector } from 'reselect'
import { createLargeCacheSelector } from '../helpers/arrayHelpers.js'
import { loopedNoteSelector } from './selectorPianoroll.js'

const tracksSelector = (state) => (state.phrase.present.tracks)
const clipsSelector = (state) => (state.phrase.present.clips)
const notesSelector = (state) => (state.phrase.present.notes)
const midiEventsSelector = (state) => (state.phrase.present.midiEvents)

const noteMidiSelector = createLargeCacheSelector(
  note => note,
  (note) => {
    let startCommand = {
      ...note,
      bar: note.start,
      velocity: note.velocity || 127,
      type: `addNoteOn`,
    }
    let endCommand = {
      ...note,
      bar: note.end,
      velocity: 0,
      type: `addNoteOff`,
    }
    return [startCommand, endCommand]
  }
)

export const phraseMidiSelector = createSelector(
  clipsSelector,
  notesSelector,
  midiEventsSelector,
  (clips, notes, midiEvents) => {
    // Render a copy of each note for each loop iteration of it's respective clip
    let allLoopedNotes = (notes || [])
      .reduce((allLoopedNotes, note) => {
        let loopedNote = loopedNoteSelector({ note, clips })
        return [...allLoopedNotes, ...loopedNote]
      }, [])

    // Convert each note into a start and stop MIDI command
    let midiCommands = (allLoopedNotes || [])
      .reduce((midiCommands, note) => {
        return [...midiCommands, ...noteMidiSelector(note) ]
      }, [])
      .concat(midiEvents || [])
      .sort((a, b) => a.bar - b.bar)

    return midiCommands
  }
)

export const phraseAudioSelector = createSelector(
  tracksSelector,
  clipsSelector,
  (tracks, clips) => {

    let audioTrackIds = tracks
      .filter(track => track.type === "AUDIO")
      .map(track => track.id)
    let audioClips = clips
      .filter(clip => audioTrackIds.includes(clip.trackID))
      .sort((a, b) => a.start > b.start)

    return audioClips
  }
)
