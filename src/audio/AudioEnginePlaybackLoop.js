import _ from 'lodash'

import {
  transportMovePlayhead,
  transportStop
} from '../reducers/reduceTransport.js'

import {
  fireNote,
  killNote,
  fireAudio,
  killAudio,
  sendMidiEvent,
} from './AudioEngineMidiTriggers.js'

import {
  BEATS_PER_BAR,
  SECONDS_PER_MINUTE,
  barToPlayTime,
  playTimeToBar,
} from 'helpers/audioHelpers'

// ============================================================================
// PLAY START
// ============================================================================
// This function initializes a tight setInterval loop. In this loop, the next
// few milliseconds worth of midi commands are scheduled, and the playhead is
// moved.
//
// TODO: Use WebWorkers to trigger each tick of the loop, to avoid playback
//       stutter when tab moves to the background. Example:
//       https://github.com/cwilso/metronome/blob/master/js/metronome.js
export function startPlayback(engine, dispatch) {

  console.log('startPlayback()', engine.ctx.currentTime)

  // Keep track of when playback began
  engine.isPlaying = true
  engine.isRecording = engine.lastState.transport.recording
  engine.playheadPositionBars = engine.lastState.transport.playhead
  engine.playStartTime = engine.ctx.currentTime - engine.playheadPositionBars * BEATS_PER_BAR * SECONDS_PER_MINUTE / engine.lastState.phrase.present.tempo

  // Setup first iteration
  engine.metronomeTickCount = engine.lastState.transport.recording && engine.lastState.transport.countIn ? -4 : 0
  engine.metronomeNextTick = Math.ceil(engine.lastState.transport.playhead * 4) * 0.25

  // Find first command ahead of playhead + sheduling offset
  engine.iCommand = engine.midiCommands.findIndex(x =>
    x.bar >= engine.lastState.transport.playhead + 0.05
  )

  let currentCommand = engine.midiCommands[engine.iCommand]
  let currentCommandTime = currentCommand ? barToPlayTime(currentCommand.bar, engine) : null

  const playBackLoop = () => {

    // Schedule up to the next few milliseconds worth of notes
    while (currentCommandTime <= engine.ctx.currentTime + 0.10) {

      // Play current Audio Clips
      let currentAudioClips = engine.audioClips.filter(clip => {
        return clip.start <= engine.playheadPositionBars &&
          clip.end > engine.playheadPositionBars
      })

      // Empty section at end of song (no more commands) - escape
      let noMoreNotes = engine.iCommand < 0 || engine.iCommand >= engine.midiCommands.length
      let noMoreAudio = currentAudioClips.length === 0
      if (noMoreNotes && noMoreAudio)
        break

      currentAudioClips.forEach(clip => {
        fireAudio({
          engine,
          clip,
        })
      })

      if (currentCommand && [`addNoteOn`, `addNoteOff`].some(t => currentCommand.type === t)) {
        fireNote({
          engine,
          trackID: currentCommand.trackID,
          keyNum: currentCommand.keyNum,
          velocity: currentCommand.velocity,
          time: currentCommandTime,
          disableRecording: true,
        })
      }
      else if (currentCommand) {
        sendMidiEvent({
          engine,
          trackID: currentCommand.trackID,
          type: currentCommand.type,
          key: currentCommand.key,
          velocity: currentCommand.velocity,
          disableRecording: true,
        })
      }

      // Iterate to next command
      engine.iCommand++
      if (engine.iCommand >= engine.midiCommands.length)
        break
      currentCommand = engine.midiCommands[engine.iCommand]
      currentCommandTime = barToPlayTime(currentCommand.bar, engine)
    }

    // Metronome
    let metronomeTime = barToPlayTime(engine.metronomeNextTick, engine)
    let useCountIn = engine.isRecording && engine.lastState.transport.countIn && engine.metronomeTickCount < 0
    let useMetronome = engine.lastState.transport.metronome
    while (metronomeTime <= engine.ctx.currentTime + 0.10) {
      if (useCountIn || useMetronome) {
        engine.metronomeNextTick % 1.0 === 0
         ? engine.metronome.tick(metronomeTime)
         : engine.metronome.tock(metronomeTime)
      }
      engine.metronomeNextTick += 0.25
      engine.metronomeTickCount++
      metronomeTime = barToPlayTime(engine.metronomeNextTick, engine)
    }

    // Update playhead
    engine.playheadPositionBars = playTimeToBar(engine.ctx.currentTime, engine)
    dispatch(transportMovePlayhead(engine.playheadPositionBars))

    // End of the timeline - STOP
    if (engine.playheadPositionBars >= engine.lastState.phrase.present.barCount)
      dispatch(transportStop())

  }

  // BEGIN!!!
  playBackLoop()
  engine.scheduleLooper = setInterval(playBackLoop, 5)

}

// ============================================================================
// PLAY STOP
// ============================================================================
// This function kills all active sounds and cancels the playback setInterval
// loop. It also clears flags that are used to queue up other behaviours where
// necessary
export function stopPlayback(engine, state) {

  console.log('stopPlayback()', engine.ctx.currentTime)

  // Kill all active sounds
  _.forOwn(engine.trackModules, (trackModule, trackID) => {
    let track = state.phrase.present.tracks.find(track => +track.id === +trackID)
    if (track.type === "AUDIO") {
      killAudio({engine, trackID })
    } else {
      for (let keyNum = 1; keyNum <= 128; keyNum++) {
        killNote({
          engine,
          trackID,
          keyNum,
          disableRecording: true,
        })
      }
    }
  })

  // Cancel the playback setInterval loop
  if (engine.scheduleLooper) {
    clearInterval(engine.scheduleLooper)
    engine.scheduleLooper = null
  }

  // Reset flags
  engine.metronomeNextTick = null
  engine.metronome.cancel()
  engine.stopQueued = false
  engine.isPlaying = false
}
