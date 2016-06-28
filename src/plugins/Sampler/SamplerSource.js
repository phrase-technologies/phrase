import _ from 'lodash'
import { getFrequencyFromKeyNum } from 'helpers/audioHelpers'

const DEFAULT_EASING = 0.001

export default class SamplerSource {

  constructor(AudioContext, {
    sample = `piano`
  }) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {

  }

  fireNote(keyNum, velocity, time = 0, detune) {
    // Handle kill signals first
  }

  destroy() {
    this.outputGain.disconnect()
  }

}
