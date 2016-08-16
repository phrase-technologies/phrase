import load from 'audio-loader'
import _ from 'lodash'
import { samples as samplesActions } from 'actions/actions'

// Piano for now, but this is a basic sampler, and Piano could inherit to
// implement Piano specific things like dampening or something..

let distanceBetweenSamples = 6
let middleCOffset = 9
let numberOfKeys = 88

let samplesToLoadByKey =
  _.range(middleCOffset, middleCOffset + numberOfKeys)
  .filter(x => x % distanceBetweenSamples === 0)

export default class PianoSource {
  constructor(AudioContext, config, STORE) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.outputGain.gain.value = 8.0
    this.bufferMap = {}
    this.activeSources = []
    this.sustain = false

    let storeSamples = STORE.getState().samples

    // TODO: load single soundfont file / chunks
    // https://www.clicktorelease.com/code/typed-array-web-audio/

    let pianoSamples = storeSamples.find(x => x.id === 'Piano')
    // If Piano instrument has already loaded once, don't fetch the samples again
    if (pianoSamples) {
      this.bufferMap = pianoSamples.bufferMap
      return
    }

    STORE.dispatch({
      type: samplesActions.LOADING,
      payload: {
        id: 'Piano',
        totalSamples: samplesToLoadByKey.length * 4,
        samplesLoaded: 0,
      }
    })

    let samples = _.flatMap(
      samplesToLoadByKey.map(x =>
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
        STORE.dispatch({
          type: samplesActions.LOADING,
          payload: {
            id: 'Piano',
            samplesLoaded: samplesLoadedCount,
          }
        })
      })
    )
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  update(config) {

  }

  onMidiEvent({ type, key, velocity }) {
    // sustain
    if (type === 176 && velocity) {
      this.sustain = true
    } else if (type === 176 && !velocity) {
      this.sustain = false

      this.activeSources
        .filter(x => x.removeWhenSustainOff)
        .forEach(source => this.scheduleRelease(source))

      this.activeSources = this.activeSources.filter(x => !x.removeWhenSustainOff)
    }
  }

  fireNote(keyNum, velocity) {
    // Find nearest sample based on note velocity
    let nearestSample = velocity < 31
      ? 30 : velocity < 51
      ? 50 : velocity < 81
      ? 80 : 120

    // keynum - 13 makes detune go from -200 to 300 at 2 notes per octave
    let nearestKeyNumIndex =
      Math.round(((keyNum - 13) / numberOfKeys) * samplesToLoadByKey.length)

    let nearestKeyNum = samplesToLoadByKey[nearestKeyNumIndex]
    let buffer = this.bufferMap[`${nearestKeyNum}-${nearestSample}`]

    // An error has occured! There should always be a buffer.
    if (!buffer) return

    let activeSource = this.activeSources.find(x => x.keyNum === keyNum)
    if (!velocity && activeSource) {
      if (!this.sustain) {
        // No sustain and no velocity, schedule its release
        this.scheduleRelease(activeSource)
        this.activeSources = this.activeSources.filter(x => x.keyNum !== keyNum)
      }
      else {
        // Note off, but sustain is down. Schedule release when pedal lifts
        this.activeSources.forEach(x => x.removeWhenSustainOff = true)
      }
    }
    else if (velocity && !activeSource) {
      // Regular note on event
      this.triggerSound({ buffer, keyNum, velocity, nearestKeyNum })
    }
    else if (velocity && activeSource && this.sustain) {
      // Note event, but key is currently sustained. Release it and refire right away
      this.scheduleRelease(activeSource)
      this.activeSources = this.activeSources.filter(x => x.keyNum !== keyNum)
      this.triggerSound({ buffer, keyNum, velocity, nearestKeyNum })
    }
  }

  triggerSound({ buffer, keyNum, velocity, nearestKeyNum }) {
    // Reduce gain of chosen sample by velocity
    let dampen = velocity < 31
      ? velocity / 30 : velocity < 51
      ? velocity / 50 : velocity < 81
      ? velocity / 80 : velocity / 127
    // Create source + volume for ADSR
    let source = this.ctx.createBufferSource()
    let sourceGain = this.ctx.createGain()

    let detuneAmount = (keyNum - nearestKeyNum) * 100

    try { // detune is readonly in safari
      source.detune.value = detuneAmount
    } catch (e) {
      // 1 octave higher (12 keys) is double the playback rate, so 2^(x/12) works
      source.playbackRate.value = Math.pow(2, (detuneAmount / 100) / 12)
    }

    source.buffer = buffer
    source.connect(sourceGain)
    sourceGain.connect(this.outputGain)

    // Invert min / max, such that value approaching 0 is reduction amount
    sourceGain.gain.value = 1 - Math.abs(dampen - 1)

    // Play sound + add to local sources array
    source.start()
    this.activeSources.push({ keyNum, source, sourceGain })
  }

  scheduleRelease(source) {
    let now = this.ctx.currentTime
    let amplitude = source.sourceGain.gain
    amplitude.cancelScheduledValues(now)
    amplitude.setValueAtTime(amplitude.value, now)
    amplitude.linearRampToValueAtTime(0, now + 0.28)
  }

}
