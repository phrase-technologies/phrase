import load from 'audio-loader'
import _ from 'lodash'

// Piano for now, but this is a basic sampler, and Piano could inherit to
// implement Piano specific things like dampening or something..

export default class PianoSource {
  constructor(AudioContext, config) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.outputGain.gain.value = 8.0
    this.bufferMap = {}
    this.activeSources = []

    // TODO: load single soundfont file / chunks
    // https://www.clicktorelease.com/code/typed-array-web-audio/

    let samples = _.range(9, 97).map(x => ({
      id: `${x}-80`, audio: `${API_URL}/piano/${x}-80.mp3`
    }))

    samples.forEach(sample =>
      load(this.ctx, sample).then(result => {
        this.bufferMap[result.id] = result.audio
      })
    )
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {

  }

  fireNote(keyNum, velocity, time = 0, detune) {
    // TODO: get correct note by velocity range
    let buffer = this.bufferMap[`${keyNum}-80`]

    if (!buffer) return

    let active = this.activeSources.find(x => x.keyNum === keyNum)
    if (!velocity && active) {
      // Schedule Release
      let now = this.ctx.currentTime
      let amplitude = active.sourceGain.gain
      amplitude.cancelScheduledValues(now)
      amplitude.setValueAtTime(amplitude.value, now)
      amplitude.linearRampToValueAtTime(0, now + 0.35)

      // Dispose of source
      this.activeSources = this.activeSources.filter(x => x.keyNum !== keyNum)
    }
    else if (velocity && !active) {
      // Create source + volume for ADSR
      let source = this.ctx.createBufferSource()
      let sourceGain = this.ctx.createGain()
      source.buffer = buffer
      source.connect(sourceGain)
      sourceGain.connect(this.outputGain)

      // Play sound + add to local sources array
      source.start()
      this.activeSources.push({ keyNum, source, sourceGain })
    }
  }

}
