import _ from 'lodash'

/*
 *  Delay
 *
 *  config {
 *    delayTime in ms or beats?
 *    feedback
 *    wet dry
 *  }
 */

export default class Delay {
  constructor(AudioContext, config) {
    this.ctx = AudioContext

    this.inputGain = this.ctx.createGain()
    this.outputGain = this.ctx.createGain()

    this.delayNodes = _.range(1, 5).map(x => {
      let delay = this.ctx.createDelay(x * config.time)
      let gain = this.ctx.createGain()

      this.inputGain.connect(delay)
      delay.connect(gain)
      gain.connect(this.outputGain)
      gain.gain.value = 1 / x * config.time
      return delay
    })

    this.inputGain.connect(this.outputGain)
  }

  getInputNode() {
    return this.inputGain
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {
    //  TODO: update all the things
    this.delayNodes.forEach((node, i) => node.delayTime.value = (i + 1) * config.time)
  }
}
