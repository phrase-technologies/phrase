export default class AudioSource {
  constructor(AudioContext) {
    this.ctx = AudioContext
    this.outputGain = this.ctx.createGain()
    this.activeSources = {}
  }

  connect(target) {
    this.outputGain.connect(target)
  }

  fireAudio({ id, buffer, currentPosition, duration }) {
    if (this.activeSources[id])
      return

    let source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.outputGain)
    source.start(this.ctx.currentTime, currentPosition, duration)

    // Add to local sources array
    this.activeSources[id] = source
  }

  update() {

  }

  onMidiEvent() {

  }

  killAudio() {
    // Stop each clip
    for (let id in this.activeSources)
      this.activeSources[id].stop()

    // Release from memory
    this.activeSources = {}
  }

}
