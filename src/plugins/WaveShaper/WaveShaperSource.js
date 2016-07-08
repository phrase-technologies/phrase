class WaveShaperSource {
  constructor(AudioContext, config) {
    this.ctx = AudioContext
    this.input = this.ctx.createGain()
    this.output = this.ctx.createGain()
  }

  getInputNode() {
    this.input
  }

  update(config) {

  }

  connect(target) {
    this.outputGain.connect(target)
  }
}

export default WaveShaperSource