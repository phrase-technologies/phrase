// ============================================================================
// Top Level Reducers
// ============================================================================
// However, there are certain actions that are dependent on data from more than
// one branch of the state. We will call these "Top Level Reducers," and they
// will be given access to the ENTIRE state, for those reductions that need it.
import u from 'updeep'
import { zoomInterval } from '../helpers/intervalHelpers.js'
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { currentNotesSelector } from '../selectors/selectorPianoroll.js'
import { mixer,
         pianoroll,
         phrase } from '../actions/actions.js'
import { getTracksHeight } from '../helpers/trackHelpers.js'

export default function reduceAll(state = {}, action) {

  switch (action.type) {

    // ------------------------------------------------------------------------
    // Ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.SCROLL_X:
    case mixer.RESIZE_WIDTH:
      return u({
        mixer: restrictTimelineZoom(state.mixer, state.phrase.barCount)
      }, state)
    case pianoroll.SCROLL_X:
    case pianoroll.RESIZE_WIDTH:
      return u({
        pianoroll: restrictTimelineZoom(state.pianoroll, state.phrase.barCount)
      }, state)

    // ------------------------------------------------------------------------
    // Track absolute height to control vertical scrollbar overflow
    case phrase.CREATE_TRACK:
    case mixer.RESIZE_HEIGHT:
      var contentHeight = getTracksHeight(state.phrase.tracks)
      if (contentHeight <= state.mixer.height) {
        return u({
          mixer: {
            yMin: 0.000,
            yMax: 1.000
          }
        }, state)
      } else {
        let fulcrum;
             if( state.mixer.yMin < 0.001 ) { fulcrum = 0.000 }
        else if( state.mixer.yMax > 0.999 ) { fulcrum = 1.000 }

        let oldWindow = state.mixer.yMax - state.mixer.yMin
        let newWindow = state.mixer.height / contentHeight
        let zoomFactor = newWindow/oldWindow
        let [newMin, newMax] = zoomInterval([state.mixer.yMin, state.mixer.yMax], zoomFactor, fulcrum);

        return u({
          mixer: {
            yMin: newMin,
            yMax: newMax
          }
        }, state)
      }

    // ------------------------------------------------------------------------
    // Select a Phrase's Notes via the Pianoroll
    case pianoroll.SELECTION_BOX_APPLY:
      // Outer Bounds
      var left   = Math.min( state.pianoroll.selectionStartX, state.pianoroll.selectionEndX )
      var right  = Math.max( state.pianoroll.selectionStartX, state.pianoroll.selectionEndX )
      var top    = Math.max( state.pianoroll.selectionStartY, state.pianoroll.selectionEndY )
      var bottom = Math.min( state.pianoroll.selectionStartY, state.pianoroll.selectionEndY )            

      // Find selected notes, even in loop iterations
      var selectedNoteIDs = currentNotesSelector(state)
        .filter(note => {
          return (
            note.trackID == state.pianoroll.currentTrack &&
            note.start  <  right &&
            note.end    >= left &&
            note.keyNum <= top + 1 &&
            note.keyNum >= bottom
          )
        })
        .map(note => note.id)
      selectedNoteIDs = _.unique(selectedNoteIDs)

      // Update selected notes, deselect any selected clips, clear selection box
      return u({
        phrase: {
          notes: notes => {
            return notes.map(note => {
              // Inside Selection Box
              if (selectedNoteIDs.includes(note.id)) {
                return u({
                  selected: action.union ? !note.selected : true
                }, note)
              // Outside Selection Box
              } else {
                return u({
                  selected: action.union ? note.selected : false
                }, note)
              }
            })
          },
          clips: u.updateIn(['*', 'selected'], false)
        },
        pianoroll: {
          selectionStartX: null,
          selectionStartY: null,
          selectionEndX: null,
          selectionEndY: null
        }
      }, state);

    // ------------------------------------------------------------------------
    default:
      return state

  }
} 


// Make sure timeline doesn't zoom too close
const maxBarWidth = 1000
function restrictTimelineZoom(stateBranch, barCount) {
  var timelineWidth = stateBranch.width / (stateBranch.xMax - stateBranch.xMin)
  var barWidth = timelineWidth / barCount
  if (barWidth > maxBarWidth) {
    let [xMin, xMax] = zoomInterval([stateBranch.xMin, stateBranch.xMax], barWidth/maxBarWidth)
    stateBranch = u({
      xMin: xMin,
      xMax: xMax
    }, stateBranch)
  }
  return stateBranch
}


