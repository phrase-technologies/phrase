import STORE from '../reducers/createStore.js'
import { phraseMidiSelector } from '../selectors/selectorTransport.js'
import { transportStop } from '../actions/actionsTransport.js'
import { phraseMovePlayhead } from '../actions/actionsPhrase.js'

var AudioContext = AudioContext || webkitAudioContext
var ctx = new AudioContext()
var oscillators = []
var amplitudeEnvelopes = []
var masterBus = ctx.createGain()
    masterBus.connect( ctx.destination )

var scheduleLooper = null
var unsubscribeStoreChanges = null
var bpm = 128
var keyFrequency = [] // Set the frequencies for the notes
    for( var i = 1; i <= 88; i++ ) { keyFrequency[i] = Math.pow(2, (i-49)/12) * 440 }

export function audioStop() {
  console.log("audioStop()")

  for(var keyNum = 1; keyNum <= 88; keyNum++)
    runMidiCommand( keyNum, 0, 0)

  if (scheduleLooper)
    clearInterval(scheduleLooper)
  scheduleLooper = null

  if (unsubscribeStoreChanges)
    unsubscribeStoreChanges()
  unsubscribeStoreChanges = null
}

export function audioPlay() {
  console.log("audioPlay()")

  // Already running? Ignore
  if (scheduleLooper)
    return

  var state = STORE.getState()
  var midiCommands = phraseMidiSelector(state)
  var iCommand = 0
  var currentCommand
  var currentCommandTime
  unsubscribeStoreChanges = STORE.subscribe(() => {
    state = STORE.getState()
    midiCommands = phraseMidiSelector(state)
    iCommand = midiCommands.findIndex(command => command.bar >= currentCommand.bar)
    currentCommand = midiCommands[iCommand]
  })

  // Nothing to play? Ignore
  if (midiCommands.length == 0) {
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

  var playStart = ctx.currentTime;

  // Looping
  // ...
  // var loop = 0;
  // var barsPerLoop = state.phrase.barCount

  iCommand = 0
  currentCommand = midiCommands[iCommand]
  currentCommandTime = barToPlayTime(currentCommand.bar, playStart)

  scheduleLooper = setInterval(function(){
    var currentBar = playTimeToBar(ctx.currentTime, playStart)
    STORE.dispatch( phraseMovePlayhead(currentBar) )

    // Empty section at end of song
    if (iCommand >= midiCommands.length)
      return

    // Schedule up to the next 40 ms worth of notes
    while (currentCommandTime <= ctx.currentTime + 0.10) {
      runMidiCommand( currentCommand.keyNum, currentCommand.velocity, currentCommandTime)

      iCommand++
      if (iCommand >= midiCommands.length)
        break

      currentCommand = midiCommands[iCommand]
      currentCommandTime = barToPlayTime(currentCommand.bar, playStart)
    }

    // Reached the end of loop
    if (iCommand >= midiCommands.length) {
      // End the loop
      clearInterval(scheduleLooper)

      // Queue up the stop command
      setTimeout(() => {
        STORE.dispatch( phraseMovePlayhead(0) )
        STORE.dispatch( transportStop() )
      }, 1000*(currentCommandTime - ctx.currentTime))

      // If we want to continue looping...
      // ...
    }
  }, 5)
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

export function runMidiCommand(key, velocity, time) {
  var easing  = 0.001

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

  // Render the velocity
  amplitudeEnvelope.gain.cancelScheduledValues( time )
  amplitudeEnvelope.gain.setValueAtTime( 0.0, time )
  amplitudeEnvelope.gain.setTargetAtTime( 0.125*velocity/127, time, easing )
}
