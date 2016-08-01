import load from 'audio-loader'
import _ from 'lodash'
import { samples as samplesActions } from 'actions/actions'
import { addNotification } from 'reducers/reduceNotification'

// Piano for now, but this is a basic sampler, and Piano could inherit to
// implement Piano specific things like dampening or something..

export default class PianoSource {
  constructor(AudioContext, config, STORE) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.outputGain.gain.value = 8.0
    this.bufferMap = {}
    this.activeSources = []

    let storeSamples = STORE.getState().samples

    // TODO: load single soundfont file / chunks
    // https://www.clicktorelease.com/code/typed-array-web-audio/

    let pianoSamples = storeSamples.find(x => x.id === 'Piano')
    // If Piano instrument has already loaded once, don't fetch the samples again
    if (pianoSamples) {
      this.bufferMap = pianoSamples.bufferMap
      return
    }

    let samples = _.flatMap(
      _.range(0, 88).map(x =>
        [30, 50, 80, 120].map(v => ({
          id: `${x}-${v}`, audio: `${API_URL}/piano/${x}-${v}.mp3`,
        }))
      )
    )

    let samplesLoadedCount = 0
    samples.forEach(sample =>
      load(this.ctx, sample).then(result => {
        this.bufferMap[result.id] = result.audio
        samplesLoadedCount++
        if (samplesLoadedCount === samples.length) {
          STORE.dispatch({
            type: samplesActions.LOADED,
            payload: { id: 'Piano', bufferMap: this.bufferMap }
          })
          STORE.dispatch(addNotification({
            title: 'Piano samples',
            message: 'have finished loading' 
          }))
        }
      })
    )
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {

  }

  fireNote(keyNum, velocity, time = 0, detune) {
    // Find nearest sample based on note velocity
    let nearestSample = velocity < 31
      ? 30 : velocity < 51
      ? 50 : velocity < 81
      ? 80 : 120

    let buffer = this.bufferMap[`${keyNum - 8}-${nearestSample}`]

    // An error has occured! There should always be a buffer.
    if (!buffer) return

    // A "note on" message
    if (velocity) {
      // Create source + volume for ADSR
      let source = this.ctx.createBufferSource()
      let sourceGain = this.ctx.createGain()
      source.buffer = buffer
      source.connect(sourceGain)
      sourceGain.connect(this.outputGain)

      // Reduce gain of chosen sample by velocity
      let dampen = velocity < 31
        ? velocity / 30 : velocity < 51
        ? velocity / 50 : velocity < 81
        ? velocity / 80 : velocity / 127

      // Invert min / max, such that value approaching 0 is reduction amount
      sourceGain.gain.value = 1 - Math.abs(dampen - 1)

      // Play sound + add to local sources array
      source.start()
      this.activeSources.push({ keyNum, source, sourceGain })
    }

    else {
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
  }

}
