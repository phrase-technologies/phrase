// ============================================================================
// Top Level Reducers
// ============================================================================
// However, there are certain actions that are dependent on data from more than
// one branch of the state. We will call these "Top Level Reducers," and they
// will be given access to the ENTIRE state, for those reductions that need it.
import u from 'updeep'
import { zoomInterval,
         shiftInterval,
       } from '../helpers/intervalHelpers.js'

import { currentNotesSelector } from '../selectors/selectorPianoroll.js'
import { mixer,
         pianoroll,
         phrase,
       } from '../actions/actions.js'
import { getTracksHeight } from '../helpers/trackHelpers.js'

export default function reduceAll(state = {}, action) {

  switch (action.type) {
    // ------------------------------------------------------------------------
    // Track absolute height to control vertical scrollbar overflow
    case phrase.CREATE_TRACK:
    case mixer.RESIZE_HEIGHT:
      let contentHeight = getTracksHeight(state.phrase.present.tracks)
      if (contentHeight <= state.mixer.height) {
        return u({
          mixer: {
            yMin: 0.000,
            yMax: 1.000
          }
        }, state)
      }

      let fulcrum
           if (state.mixer.yMin < 0.001) { fulcrum = 0.000 }
      else if (state.mixer.yMax > 0.999) { fulcrum = 1.000 }

      let oldWindow = state.mixer.yMax - state.mixer.yMin
      let newWindow = state.mixer.height / contentHeight
      let zoomFactor = newWindow/oldWindow
      let [newMin, newMax] = zoomInterval([state.mixer.yMin, state.mixer.yMax], zoomFactor, fulcrum)

      return u({
        mixer: {
          yMin: newMin,
          yMax: newMax
        }
      }, state)

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
    // Set the Pianoroll's focus window
    case pianoroll.SET_FOCUS_WINDOW:
      // Figure out the measurements
      let foundClip = state.phrase.present.clips.find(clip => clip.id === action.clipID)
      let clipLength = foundClip.end - foundClip.start
      let windowBarLength = (state.pianoroll.xMax - state.pianoroll.xMin) * state.phrase.present.barCount
      let spacing = Math.min(0.5, Math.max(0.125*windowBarLength, 0.125))
      let targetBarMin, targetBarMax

      // Specially commanded to zoom tight to the clip
      if (action.tight) {
        targetBarMin = Math.max(foundClip.start - spacing, 0) / state.phrase.present.barCount
        targetBarMax = Math.min(foundClip.end   + spacing, state.phrase.present.barCount) / state.phrase.present.barCount
      }

      // Loose focus shift - let's figure out the best place to shift the window to
      else {
        let shiftAmount = 0         // Don't shift if not necessary, by default
        let shiftAmountMax = foundClip.end   + spacing - state.pianoroll.xMax * state.phrase.present.barCount // Does the target clip end beyond the ending of the window?
        let shiftAmountMin = foundClip.start - spacing - state.pianoroll.xMin * state.phrase.present.barCount // Does the target clip start before the beginning of the window?
        // If newly focused clip DOES NOT fit in the window, focus to the beginning of it
        if (spacing + clipLength + spacing > windowBarLength)
          shiftAmount = shiftAmountMin
        // If newly focused clip is able to fit in the window, we might need to shift to one end
        else {
               if (shiftAmountMax > 0) { shiftAmount = shiftAmountMax }
          else if (shiftAmountMin < 0) { shiftAmount = shiftAmountMin }
        }
        [targetBarMin, targetBarMax] = shiftInterval([state.pianoroll.xMin, state.pianoroll.xMax], shiftAmount/state.phrase.present.barCount)
      }

      // Make the change!
      return u({
        pianoroll: {
          currentTrack: foundClip.trackID,
          xMin: targetBarMin,
          xMax: targetBarMax
        }
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state

  }
}
