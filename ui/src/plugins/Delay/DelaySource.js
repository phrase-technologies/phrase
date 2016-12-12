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
  constructor(AudioContext, config, state) {
    this.ctx = AudioContext
    this.inputGain = this.ctx.createGain()
    this.outputGain = this.ctx.createGain()

    let bps = state.tempo / 60

    this.delayNodes = _.range(1, 5).map(x => {
      let delay = this.ctx.createDelay(x * (config.time * bps))
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

  update(config, state) {
    //  TODO: update all the things
    let bps = state.tempo / 60
    this.delayNodes.forEach((node, i) => {
      let time = (i + 1) * (config.time * bps)
      node.delayTime.value = time
    })
  }
}
