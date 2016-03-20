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
import { shiftInterval } from '../helpers/intervalHelpers.js'

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
      selectedNoteIDs = _.uniq(selectedNoteIDs)

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
    // Set the Pianoroll's focus window
    case pianoroll.SET_FOCUS_WINDOW:
      // Figure out the measurements
      var foundClip = state.phrase.clips.find(clip => clip.id == action.clipID)
      var clipLength = foundClip.end - foundClip.start
      var windowBarLength = (state.pianoroll.xMax - state.pianoroll.xMin) * state.phrase.barCount
      var spacing = Math.min(0.5, Math.max(0.125*windowBarLength, 0.125))
      var targetBarMin, targetBarMax

      // Specially commanded to zoom tight to the clip
      if (action.tight) {
        targetBarMin = Math.max( foundClip.start - spacing, 0                     ) / state.phrase.barCount
        targetBarMax = Math.min( foundClip.end   + spacing, state.phrase.barCount ) / state.phrase.barCount
      }

      // Loose focus shift - let's figure out the best place to shift the window to
      else {
        var shiftAmount = 0         // Don't shift if not necessary, by default
        var shiftAmountMax = foundClip.end   + spacing - state.pianoroll.xMax * state.phrase.barCount // Does the target clip end beyond the ending of the window?
        var shiftAmountMin = foundClip.start - spacing - state.pianoroll.xMin * state.phrase.barCount // Does the target clip start before the beginning of the window?
        // If newly focused clip DOES NOT fit in the window, focus to the beginning of it
        if (spacing + clipLength + spacing > windowBarLength)
          shiftAmount = shiftAmountMin
        // If newly focused clip is able to fit in the window, we might need to shift to one end
        else {
               if (shiftAmountMax > 0) { shiftAmount = shiftAmountMax }
          else if (shiftAmountMin < 0) { shiftAmount = shiftAmountMin }
        }
        [targetBarMin, targetBarMax] = shiftInterval([state.pianoroll.xMin, state.pianoroll.xMax], shiftAmount/state.phrase.barCount)
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
