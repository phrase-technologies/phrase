import _ from 'lodash'

import { transportStop } from '../actions/actionsTransport.js'
import { phraseMovePlayhead } from '../actions/actionsPhrase.js'

import { fireNote,
         killNote } from './AudioEngineMidiTriggers.js'

// ============================================================================
// PLAY START
// ============================================================================
// This function initializes a tight setInterval loop. In this loop, the next
// few milliseconds worth of midi commands are scheduled, and the playhead is
// moved. 
export function startPlayback(engine, state, dispatch) {

  console.log("startPlayback()", engine.ctx.currentTime)

  // Keep track of when playback began
  engine.isPlaying = true
  engine.playStartTime = engine.ctx.currentTime
  engine.playheadPositionBars = state.phrase.playhead

  // Nothing to play? Ignore
  if (engine.midiCommands.length == 0) {
    // Leave a delay so the PLAYING state will be visible momentarily to the user.
    setTimeout(() => {
      dispatch( phraseMovePlayhead(0) ) // TODO: redundant, activate on transportStop()
      dispatch( transportStop() )
    }, 250)
    return
  }

  // Setup first iteration
  engine.iCommand = 0
  var currentCommand = engine.midiCommands[engine.iCommand]
  var currentCommandTime = barToPlayTime(currentCommand.bar, engine, state)

  // BEGIN!!!
  engine.scheduleLooper = setInterval(() => {

    // Schedule up to the next few milliseconds worth of notes
    while (currentCommandTime <= engine.ctx.currentTime + 0.10) {

      // Empty section at end of song - escape
      if (engine.iCommand >= engine.midiCommands.length)
        break;

      fireNote(
        engine,
        currentCommand.trackID,
        currentCommand.keyNum,
        currentCommand.velocity,
        currentCommandTime
      )

      // Iterate to next command
      engine.iCommand++
      if (engine.iCommand >= engine.midiCommands.length)
        break
      currentCommand = engine.midiCommands[engine.iCommand]
      currentCommandTime = barToPlayTime(currentCommand.bar, engine, state)
    }

    // Update playhead
    engine.playheadPositionBars = playTimeToBar(engine.ctx.currentTime, engine, state)
    dispatch( phraseMovePlayhead(engine.playheadPositionBars) )

    // Reached the end of loop
    if (engine.iCommand >= engine.midiCommands.length) {

      // Queue up the stop command
      if (!engine.stopQueued) {
        engine.stopQueued = true

        setTimeout(() => {
          dispatch( phraseMovePlayhead(0) ) // TODO: redundant, activate on transportStop()
          dispatch( transportStop() )
        }, 1000*(currentCommandTime - engine.ctx.currentTime))
      }

    }

  }, 5)

}

// ============================================================================
// PLAY START
// ============================================================================
// This function kills all active sounds and cancels the playback setInterval
// loop. It also clears flags that are used to queue up other behaviours where
// necessary
export function stopPlayback(engine, state) {

  console.log("stopPlayback()", engine.ctx.currentTime)

  // Kill all active sounds
  _.forOwn(engine.trackModules, (track, trackID) => {
    for (var keyNum = 1; keyNum <= 88; keyNum++)
      killNote(engine, trackID, keyNum)
  })

  // Cancel the playback setInterval loop
  if (engine.scheduleLooper) {
    clearInterval(engine.scheduleLooper)
    engine.scheduleLooper = null
  }

  // Reset flags
  engine.stopQueued = false
  engine.isPlaying = false
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function barToPlayTime(bar, engine, state) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  var playStartTime = engine.playStartTime || engine.ctx.currentTime

  return bar * 120 / state.phrase.tempo + playStartTime
}

function playTimeToBar(time, engine, state) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  var playStartTime = engine.playStartTime || engine.ctx.currentTime

  return (time - playStartTime) / 120 * state.phrase.tempo
}
