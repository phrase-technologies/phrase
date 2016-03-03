import { getFrequencyFromKeyNum } from '../helpers/audioHelpers.js'

const DEFAULT_EASING = 0.001

export default class SynthPoly {

  constructor(AudioContext) { 
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.amplitudeEnvelope = this.ctx.createGain()
    this.amplitudeEnvelope.gain.value = 0
    this.amplitudeEnvelope.connect(this.outputGain)
    this.oscillator = this.ctx.createOscillator()
    this.oscillator.connect(this.amplitudeEnvelope)
    this.oscillator.type = "square"
    this.oscillator.start()
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  fireNote(keyNum, velocity, time = 0) {
    // If this voice has been stolen, ignore "dud" kill signals
    if (velocity == 0 && this.lastNote != keyNum)
      return

    // Schedule the key change
    var frequency = getFrequencyFromKeyNum(keyNum)
    this.oscillator.frequency.cancelScheduledValues( time )
    this.oscillator.frequency.setValueAtTime(frequency, time) // TODO: Legato

    // Schedule the Amplitude change
    this.amplitudeEnvelope.gain.cancelScheduledValues( time )
    this.amplitudeEnvelope.gain.setValueAtTime(0, time)                             // End any previous note
    this.amplitudeEnvelope.gain.setTargetAtTime(velocity/127, time, DEFAULT_EASING) // Begin the next note

    // Keep track of the last note
    this.lastNote = keyNum
  }

  destroy() {
    this.outputGain.disconnect()
    this.amplitudeEnvelope.disconnect()
    this.oscillator.disconnect()
  }

}