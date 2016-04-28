// ============================================================================
// Top Level Reducers
// ============================================================================
// However, there are certain actions that are dependent on data from more than
// one branch of the state. We will call these "Top Level Reducers," and they
// will be given access to the ENTIRE state, for those reductions that need it.
import u from 'updeep'

import { currentNotesSelector } from '../selectors/selectorPianoroll.js'
import { pianoroll } from '../actions/actions.js'

export default function reduceAll(state = {}, action) {

  switch (action.type) {
    // ------------------------------------------------------------------------
    // Select a Phrase's Notes via the Pianoroll
    case pianoroll.SELECTION_BOX_APPLY:
      // Outer Bounds
      let left   = Math.min(state.pianoroll.selectionStartX, state.pianoroll.selectionEndX)
      let right  = Math.max(state.pianoroll.selectionStartX, state.pianoroll.selectionEndX)
      let top    = Math.max(state.pianoroll.selectionStartY, state.pianoroll.selectionEndY)
      let bottom = Math.min(state.pianoroll.selectionStartY, state.pianoroll.selectionEndY)

      // Find selected notes, even in loop iterations
      let selectedNoteIDs = currentNotesSelector(state)
        .filter(note => {
          return (
            note.trackID === state.pianoroll.currentTrack &&
            note.start  <  right &&
            note.end    >= left &&
            note.keyNum <= top + 1 &&
            note.keyNum >= bottom
          )
        })
        .map(note => note.id)
      selectedNoteIDs = _.uniq(selectedNoteIDs)

      // Update selected notes, deselect any selected clips, clear selection box
      return u({
        phrase: {
          present: {
            notes: notes => {
              return notes.map(note => {
                // Inside Selection Box
                if (selectedNoteIDs.includes(note.id)) {
                  return u({
                    selected: action.union ? !note.selected : true
                  }, note)
                // Outside Selection Box
                }
                return u({
                  selected: action.union ? note.selected : false
                }, note)
              })
            },
            clips: u.updateIn(['*', 'selected'], false)
          }
        },
        pianoroll: {
          selectionStartX: null,
          selectionStartY: null,
          selectionEndX: null,
          selectionEndY: null
        }
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state

  }
}
