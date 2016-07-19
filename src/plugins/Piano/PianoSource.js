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

    let samples = _.flatMap(
      _.range(4, 79).map(x =>
        [30, 50, 80, 120].map(v => ({
          id: `${x}-${v}`, audio: `${API_URL}/piano/${x}-${v}.mp3`,
        }))
      )
    )

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
    let nearestSample = velocity < 31
      ? 30 : velocity < 51
      ? 50 : velocity < 81
      ? 80 : 120

    let dampen = velocity < 31
      ? velocity / 30 : velocity < 51
      ? velocity / 50 : velocity < 81
      ? velocity / 80 : velocity / 127

    dampen = Math.abs(dampen - 1)

    let buffer = this.bufferMap[`${keyNum - 8}-${nearestSample}`]

    if (!buffer) return

    if (!velocity) { // note off
      let active = this.activeSources.find(x => x.keyNum === keyNum)

      if (active) {

        // Schedule Release
        let now = this.ctx.currentTime
        let amplitude = active.sourceGain.gain
        amplitude.cancelScheduledValues(now)
        amplitude.setValueAtTime(amplitude.value, now)
        amplitude.linearRampToValueAtTime(0, now + 0.35)

        // Dispose of source
        this.activeSources = this.activeSources.filter(x => x.keyNum !== keyNum)
      }
    }
    else if (velocity && !active) {
      // Create source + volume for ADSR
      let source = this.ctx.createBufferSource()
      let sourceGain = this.ctx.createGain()
      source.buffer = buffer
      source.connect(sourceGain)
      sourceGain.connect(this.outputGain)

      // Reduce gain of chosen sample by velocity values lower than it's trigger point
      sourceGain.gain.value = 1 - dampen
      
      // Play sound + add to local sources array
      source.start()
      this.activeSources.push({ keyNum, source, sourceGain })
    }
  }

}
