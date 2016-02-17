import STORE from '../reducers/createStore.js'
import { currentNotesSelector } from '../selectors/selectorPianoroll.js'
import { transportStop } from '../actions/actionsTransport.js'
import { phraseMovePlayhead } from '../actions/actionsPhrase.js'

var AudioContext = AudioContext || webkitAudioContext
var ctx = new AudioContext()
var oscillators = []
var amplitudeEnvelopes = []
var masterBus = ctx.createGain()
    masterBus.connect( ctx.destination )

var scheduleLooper = null
var bpm = 128
var keyFrequency = [] // Set the frequencies for the notes
    for( var i = 1; i <= 88; i++ ) { keyFrequency[i] = Math.pow(2, (i-49)/12) * 440 }

export function audioStop() {
  console.log("audioStop()")

  if (scheduleLooper)
    clearInterval(scheduleLooper)
  scheduleLooper = null
}

export function audioPlay() {
  console.log("audioPlay()")

  var state = STORE.getState()
  var playStart = ctx.currentTime;
  var loop = 0;
  var barsPerLoop = state.phrase.barCount
  var notes = currentNotesSelector(state)
    .concat([]) // Make a copy so we don't mutate the original
    .sort((noteA, noteB) => { // Sort by starting time
      return noteA.start - noteB.start;
    })

  // Already running? Ignore
  if (scheduleLooper)
    return

  // Nothing to play? Ignore
  if (notes.length == 0) {
    // Leave a delay, for 2 reasons:
    // 1. We are still inside a redux action creator, so technically
    //    the state is not even set to playing yet.
    // 2. We want the PLAYING state to be visible momentarily to the user.
    setTimeout(() => {
      STORE.dispatch( phraseMovePlayhead(0) )
      STORE.dispatch( transportStop() )
    }, 250)
    return
  }

  var iterator = notes[Symbol.iterator]()
  var iteration = iterator.next()
  var note = iteration.value

  scheduleLooper = setInterval(function(){
    var currentBar = playTimeToBar(ctx.currentTime, playStart)
    STORE.dispatch( phraseMovePlayhead(currentBar) )

    // Empty section at end of song
    if (iteration.done)
      return

    // Schedule up to the next 40 ms worth of notes
    var startTime = barToPlayTime( note.start + loop*barsPerLoop, playStart );
    var   endTime = barToPlayTime( note.end   + loop*barsPerLoop, playStart );
    while (startTime <= ctx.currentTime + 0.40) {
      playSingleNote( note.keyNum, 127, startTime + 0.1, endTime + 0.1); // Offset by 0.1s to prevent missed notes? TODO investigate!

      iteration = iterator.next()
      note = iteration.value
      if (iteration.done)
        break

      startTime = barToPlayTime( note.start + loop*barsPerLoop, playStart );
        endTime = barToPlayTime( note.end   + loop*barsPerLoop, playStart );
    }

    // Reached the end of loop
    if (iteration.done) {
      // Queue up the stop command
      setTimeout(() => {
        STORE.dispatch( phraseMovePlayhead(0) )
        STORE.dispatch( transportStop() )
      }, 1000 * (endTime - ctx.currentTime))

      // If we want to continue looping...
      // iterator = notes[Symbol.iterator]()
      // iteration = iterator.next()
      // note = iteration.value
    }
  }, 25)
}

export function barToPlayTime(bar, playStart) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  playStart = playStart || ctx.currentTime

  return bar * 120 / bpm + playStart
}

export function playTimeToBar(time, playStart) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  playStart = playStart || ctx.currentTime

  return (time - playStart) / 120 * bpm
}

export function playSingleNote(key, velocity, startTime, endTime) {
  startTime = startTime || ctx.currentTime;

  var attackVolume  = 0.001
  var releaseVolume = 0.001

  var amplitudeEnvelope = amplitudeEnvelopes[key]
  var currentOscillator = oscillators[key]

  // Create Amplitude Envelope if necessary
  if (! amplitudeEnvelope) {
    amplitudeEnvelopes[key] = ctx.createGain()
    amplitudeEnvelope = amplitudeEnvelopes[key]
    amplitudeEnvelope.connect(masterBus)
    amplitudeEnvelope.gain.value = 0.0
  }

  if (! currentOscillator) {
    oscillators[key] = ctx.createOscillator()
    currentOscillator = oscillators[key]
    currentOscillator.connect( amplitudeEnvelope )
    currentOscillator.start(ctx.currentTime)
  }

  // Set the synth
  currentOscillator.type = 'square'
  currentOscillator.frequency.value = keyFrequency[ key ]

  // Start a new envelope
  if (velocity > 0) {
    // Attack
    amplitudeEnvelope.gain.cancelScheduledValues( startTime )
    amplitudeEnvelope.gain.setValueAtTime( 0.0, startTime )
    amplitudeEnvelope.gain.setTargetAtTime( 0.125*velocity/127, startTime, attackVolume )

    // Release
    if (endTime) {
      amplitudeEnvelope.gain.setTargetAtTime( 0.0, endTime, releaseVolume )
    }
  }
  // Release the current envelope
  else {
    // Release
    amplitudeEnvelope.gain.cancelScheduledValues(startTime)
    amplitudeEnvelope.gain.setTargetAtTime( 0.0, startTime, releaseVolume )
  }
}
