// ============================================================================
// Combine Reducer Branches
// ============================================================================
// We use combineReducers to organize state into decoupled branches, where each
// branch represents a different module within the app. Much cleaner this way.
import reduceNavigation from './reduceNavigation.js'
import reduceTransport from './reduceTransport.js'
import reducePhrase from './reducePhrase.js'
import reduceMixer from './reduceMixer.js'
import reducePianoroll from './reducePianoroll.js'
import reduceCursor from './reduceCursor.js'

import { combineReducers } from 'redux'

var combinedReducer = combineReducers({
  navigation: reduceNavigation,
  transport: reduceTransport,
  phrase: reducePhrase,
  mixer: reduceMixer,
  pianoroll: reducePianoroll,
  cursor: reduceCursor
})


// ============================================================================
// Top Level Reducers
// ============================================================================
// However, there are certain actions that are dependent on data from more than
// one branch of the state. Below is a "Top Level Reducer" with access to the 
// ENTIRE state, for those reductions that need it.
import u from 'updeep'
import { zoomInterval } from '../helpers/intervalHelpers.js'
import { uIncrement, uAppend, uReplace } from '../helpers/arrayHelpers.js'

import { mixer,
         pianoroll,
         phrase } from '../actions/actions.js'

export default function(state = {}, action) {

  state = combinedReducer(state, action)

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
      var contentHeight = state.phrase.tracks.reduce((contentHeight, track) => {
        return contentHeight + 52 // Each standard track is 54px tall
      }, 55) // The "+Add Track" button is 56px tall
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


