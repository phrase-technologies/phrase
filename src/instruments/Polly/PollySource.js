import _ from 'lodash'
import { getFrequencyFromKeyNum } from 'helpers/audioHelpers'

const DEFAULT_EASING = 0.001

export default class PollySource {

  constructor(AudioContext, {
    polyphony = 32,
    oscillatorType = `square`
  }) {
    this.ctx = AudioContext
    this.oscillatorType = oscillatorType
    this.outputGain = this.ctx.createGain()
    this.polyphony = polyphony
    // this.VoiceClass = VoiceClass
    this.VoiceClass = MonophonicSynth
    this.voices = []
    this.activeVoices = []
    this.unusedVoices = []
    this.pitchwheelSettings = [ 2, -2 ]

    // Populate the polyphony of voices
    for (let i = 0; i < this.polyphony; i++) {
      let newVoice = new this.VoiceClass(this.ctx)
      newVoice.oscillator.type = this.oscillatorType
      newVoice.connect(this.outputGain)
      this.voices.push(newVoice)
      this.unusedVoices.push(newVoice)
    }
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {
    if (config.oscillatorType !== this.oscillatorType) {
      this.oscillatorType = config.oscillatorType
      this.voices.forEach(voice => voice.oscillator.type = config.oscillatorType)
    }
  }

  fireNote(keyNum, velocity, time = 0, detune) {
    // Handle kill signals first
    if (velocity === 0) {
      let voiceToKill = _.remove(this.activeVoices, voice => voice.lastNote === keyNum).shift()
      if (voiceToKill) {
        voiceToKill.fireNote(keyNum, 0, time, detune)
        this.unusedVoices.push(voiceToKill)
      }
      return
    }

    // Is voice already in play? Reuse voice
    let activeVoice = _.remove(this.activeVoices, voice => voice.lastNote === keyNum).shift()
    if (activeVoice) {
      activeVoice.fireNote(keyNum, velocity, time, detune)
      this.activeVoices.push(activeVoice)
      return
    }

    // Try using an inactive voice
    let unusedVoice = this.unusedVoices.shift()
    if (unusedVoice) {
      unusedVoice.fireNote(keyNum, velocity, time, detune)
      this.activeVoices.push(unusedVoice)
      return
    }

    // Nothing available, must steal!
    let stolenVoice = this.activeVoices.shift()
    if (stolenVoice) {
      stolenVoice.fireNote(keyNum, velocity, time, detune)
      this.activeVoices.push(stolenVoice)
      return
    }

    // If we get here, well technically it would only be possible if you have 0 voices. Could be cause for an exception?
    // Or maybe we should just put a bunch of rap lyrics yo.
    // I got enemies, gotta lotta enemies
    // Gotta lotta people tryna take away my energy
  }

  destroy() {
    this.outputGain.disconnect()
    this.voices.forEach(voice => voice.destroy())
  }

}

export class MonophonicSynth {

  constructor(AudioContext) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.amplitudeEnvelope = this.ctx.createGain()
    this.amplitudeEnvelope.gain.value = 0
    this.amplitudeEnvelope.connect(this.outputGain)
    this.oscillator = this.ctx.createOscillator()
    this.oscillator.connect(this.amplitudeEnvelope)
    this.oscillator.type = 'square'
    this.oscillator.start()
    this.lastNote = null
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  fireNote(keyNum, velocity, time = 0, detune) {
    // If this voice has been stolen, ignore "dud" kill signals
    if (!velocity && this.lastNote !== keyNum)
      return

    // Schedule the key change
    let frequency = getFrequencyFromKeyNum(keyNum)
    this.oscillator.frequency.cancelScheduledValues(time)
    this.oscillator.frequency.setValueAtTime(frequency, time) // TODO: Legato

    // Schedule the Amplitude change
    this.amplitudeEnvelope.gain.cancelScheduledValues(time)
    this.amplitudeEnvelope.gain.setTargetAtTime(0, Math.max(0, time - 0.001), DEFAULT_EASING) // End any previous note (TODO: Easing... exponentialRamp to 0 is NaN)
    this.amplitudeEnvelope.gain.setTargetAtTime(velocity/127, time, DEFAULT_EASING)           // Begin the next note

    // Keep track of the last note
    this.lastNote = keyNum
  }

  destroy() {
    this.outputGain.disconnect()
    this.amplitudeEnvelope.disconnect()
    this.oscillator.disconnect()
  }

}
