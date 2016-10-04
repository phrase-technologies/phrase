import load from 'audio-loader'
import {
  phraseAudioSelector,
} from 'selectors/selectorTransport'

// ============================================================================
// CONVERT AUDIO CLIPS TO PLAYBACK COMAMNDS
// ============================================================================
// This converts audio clips into playback commands
export function updateAudioCommands(engine, STORE) {

  // Playing, ensure latest notes are played next
  let audioClips = phraseAudioSelector(STORE.getState())

  if (audioClips !== engine.audioCommands) {
    engine.audioClips = audioClips
  }

}

export function killAudio({
  engine,
  trackID,
}) {
  let trackModule = engine.trackModules[trackID]
  let audioIn = trackModule.effectsChain[0]

  audioIn.killAudio()
}

export function fireAudio({
  engine,
  clip,
}) {
  let buffer = engine.bufferMap[clip.audioUrl]
  let trackModule = engine.trackModules[clip.trackID]
  let audioIn = trackModule.effectsChain[0]
  let currentPosition = engine.playheadPositionBars - clip.start
  let duration = clip.end - engine.playheadPositionBars
  let id = `${clip.id}-${clip.audioUrl}`

  if (buffer && trackModule && audioIn && duration > 0) {
    audioIn.fireAudio({ id, buffer, currentPosition, duration })
  }
}


export async function loadSample(engine, url) {
  if (!engine.bufferMap[url]) {
    let result = await load(engine.ctx, url)
    engine.bufferMap[url] = result
  }

  return {
    duration: engine.bufferMap[url].duration
  }
}

export function getSampleWaveform(engine, url) {
  if (engine.waveformMap[url])
    return engine.waveformMap[url]

  let peaks = getSamplePeaks(engine, url)
  if (peaks) {
    let canvas = document.createElement('canvas')
    let buffer = engine.bufferMap[url]
    canvas.width = Math.min(buffer.duration * 100, 32767) // 32,767 is max canvas length
    canvas.height = 400
    drawWaveform({ canvas, peaks })
    return engine.waveformMap[url] = canvas
  }

  return null
}

export function drawWaveform({
  canvas,
  peaks,
  pixelRatio = 1.0,
  channelIndex
}) {
  // Split channels if necessary
  if (peaks[0] instanceof Array) {
    let channels = peaks
    let splitChannels = true
    if (splitChannels) {
      channels.forEach((channel, channelIndex) => drawWaveform({
        canvas,
        peaks: channel,
        pixelRatio,
        channelIndex
      }))
      return
    }

    peaks = channels[0]
  }

  // Support arrays without negative peaks
  let hasMinValues = [].some.call(peaks, (val) => val < 0)
  if (!hasMinValues) {
    let reflectedPeaks = []
    for (let i = 0, len = peaks.length; i < len; i++) {
      reflectedPeaks[2 * i] = peaks[i]
      reflectedPeaks[2 * i + 1] = -peaks[i]
    }
    peaks = reflectedPeaks
  }

  // A half-pixel offset makes lines crisp
  let $ = 0.5 / pixelRatio
  let height = channelIndex === null
    ? 1.0 * canvas.height * pixelRatio
    : 0.5 * canvas.height * pixelRatio
  let offsetY = height * channelIndex || 0
  let halfH = height / 2
  let length = ~~(peaks.length / 2)

  let scale = 1
  let fillParent = false // ???? TODO
  if (fillParent && canvas.width !== length) {
    scale = canvas.width / length
  }

  let absmax = 1
  let normalize = false // ???? TODO
  if (normalize) {
    let max = WaveSurfer.util.max(peaks)
    let min = WaveSurfer.util.min(peaks)
    absmax = -min > max ? -min : max
  }

  let cc = canvas.getContext('2d')
  cc.fillStyle = "#0FF"

  cc.beginPath()
  cc.moveTo($, halfH + offsetY)

  for (let i = 0; i < length; i++) {
    let h = Math.round(peaks[2 * i] / absmax * halfH)
    cc.lineTo(i * scale + $, halfH - h + offsetY)
  }

  // Draw the bottom edge going backwards, to make a single
  // closed hull to fill.
  for (let i = length - 1; i >= 0; i--) {
    let h = Math.round(peaks[2 * i + 1] / absmax * halfH)
    cc.lineTo(i * scale + $, halfH - h + offsetY)
  }

  cc.closePath()
  cc.fill()

  // Always draw a median line
  cc.fillRect(0, halfH + offsetY - $, canvas.width, $)
}

export function getSamplePeaks(engine, url) {
  if (!engine.bufferMap[url])
    return null

  let buffer = engine.bufferMap[url]

  let length = Math.min(buffer.duration * 100, 32767) // 32,767 is max canvas length
  let sampleSize = buffer.length / length
  let sampleStep = ~~(sampleSize / 10) || 1
  let channels = buffer.numberOfChannels
  let splitPeaks = []
  let mergedPeaks = []

  for (let c = 0; c < channels; c++) {
    let peaks = splitPeaks[c] = []
    let chan = buffer.getChannelData(c)

    for (let i = 0; i < length; i++) {
      let start = ~~(i * sampleSize)
      let end = ~~(start + sampleSize)
      let min = 0
      let max = 0

      for (let j = start; j < end; j += sampleStep) {
        let value = chan[j]

        if (value > max) max = value
        if (value < min) min = value
      }

      peaks[2 * i] = max
      peaks[2 * i + 1] = min

      if (c === 0 || max > mergedPeaks[2 * i])
        mergedPeaks[2 * i] = max

      if (c === 0 || min < mergedPeaks[2 * i + 1])
        mergedPeaks[2 * i + 1] = min
    }
  }

  let splitChannels = true
  return splitChannels ? splitPeaks : mergedPeaks
}
