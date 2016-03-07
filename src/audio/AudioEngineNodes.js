import { PolyphonicSynth } from './SynthPoly.js'

const OUTPUT_METER_SIZE = 2048

// ============================================================================
// VIRTUAL AUDIO GRAPH NODES
// ============================================================================
// This function abstracts out the creation, routing, updating and removal of
// Web Audio API Nodes as dictated by changes in the `state`. 
export function updateNodes(engine, state) {

  // Remove tracks as required
  Object.keys(engine.trackModules).forEach(trackID => {
    var foundTrack = state.phrase.tracks.find(track => track.id == trackID)
    if (!foundTrack) {
      var trackModuleToRemove = engine.trackModules[trackID]
      delete engine.trackModules[trackID]
      destroyTrackModule(trackModuleToRemove)
    }
  })

  // Add/update tracks as required
  var atleastOneTrackSoloed = state.phrase.tracks.some(track => track.solo)
  state.phrase.tracks.forEach(track => {
    // Add new tracks
    if (!engine.trackModules[track.id]) {
      engine.trackModules[track.id] = createTrackModule(engine, track)
    }

    // Update changed tracks
    else {
      let muteTrack = atleastOneTrackSoloed && !track.solo || track.mute
      let trackModule = engine.trackModules[track.id]
          trackModule.outputFinal.gain.value = 1.0 * !muteTrack
    }
  })
}

// This function sends unused trackModules to the graveyard
function destroyTrackModule(trackModule) {
  trackModule.outputFinal.disconnect()
  trackModule.outputGain.disconnect()
  trackModule.outputPan.disconnect()
  trackModule.effectsChain.forEach(effect => effect.disconnect())
}

// This function births a new trackModule
function createTrackModule(engine, track) {
  // Used for MUTE / SOLO
  var outputFinal = engine.ctx.createGain()
      outputFinal.gain.value = 1.0
      outputFinal.connect(engine.masterGain)

  // Used for track GAIN
  var outputGain = engine.ctx.createGain()
      outputGain.gain.value = 1.0
      outputGain.connect(outputFinal)

  // Used for track PAN
  var outputPan = engine.ctx.createPanner()
      outputPan.connect(outputGain)
      outputPan.panningModel = 'HRTF'
      outputPan.distanceModel = 'inverse'
      outputPan.refDistance = 1
      outputPan.maxDistance = 10000
      outputPan.rolloffFactor = 1
      outputPan.coneInnerAngle = 360
      outputPan.coneOuterAngle = 0
      outputPan.coneOuterGain = 0
      outputPan.setOrientation(1,0,0)

  // Used for track METER
  var outputMeter = engine.ctx.createAnalyser()
      outputMeter.fftSize = OUTPUT_METER_SIZE
      outputGain.connect(outputMeter)

  // Used for track METER
  var outputBuffer = new Uint8Array(OUTPUT_METER_SIZE)

  // The actual sound generation!
  var synth = new PolyphonicSynth(engine.ctx, 20)
      synth.connect(outputPan)

  var effectsChain = [
    synth
  ]

  var trackModule = {
    trackID: track.id,
    outputFinal: outputFinal,
    outputGain: outputGain,
    outputPan: outputPan,
    outputBuffer: outputBuffer,
    outputMeter: outputMeter,
    effectsChain: effectsChain
  }

  return trackModule
}

export function getTrackOutputDecibels(engine, trackID) {
  var trackModule = engine.trackModules[trackID]
  if (trackModule) {
    var result = 0
    trackModule.outputMeter.getByteTimeDomainData(trackModule.outputBuffer)
    for (var i = 0; i < OUTPUT_METER_SIZE; i++) {
      let v = (trackModule.outputBuffer[i] - 128.0)/128
      result += v*v
    }
    result /= OUTPUT_METER_SIZE
    result = 20*Math.log(result)/Math.LN10
    result = result < -60 ? -Infinity : result
    return result
  } else {
    return null
  }
}
