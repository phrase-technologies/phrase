import _ from 'lodash'
import Plugins from 'plugins'

const OUTPUT_METER_SIZE = 2048

// ============================================================================
// VIRTUAL AUDIO GRAPH NODES
// ============================================================================
// This function abstracts out the creation, routing, updating and removal of
// Web Audio API Nodes as dictated by changes in the `state`.
export function updateNodes(engine, STORE) {
  let state = STORE.getState()

  // Remove tracks as required
  Object.keys(engine.trackModules).forEach(trackID => {
    let foundTrack = (state.phrase.present.tracks || []).find(track => track.id === parseInt(trackID))
    if (!foundTrack) {
      let trackModuleToRemove = engine.trackModules[trackID]
      delete engine.trackModules[trackID]
      destroyTrackModule(trackModuleToRemove)
    }
  })

  // Add/update tracks as required
  let allTracks = (state.phrase.present.tracks || [])
  let atleastOneTrackSoloed = allTracks.some(track => track.solo)

  allTracks.forEach(track => {
    // Add new tracks
    if (!engine.trackModules[track.id]) {
      engine.trackModules[track.id] = createTrackModule(engine, track, STORE)
    }

    // Update changed tracks
    else {
      let muteTrack = atleastOneTrackSoloed && !track.solo || track.mute
      let trackModule = engine.trackModules[track.id]
      trackModule.outputFinal.gain.value = 1.0 * !muteTrack
      trackModule.effectsChain.forEach((node, i) =>
        node.update(track.rack[i].config, state.phrase.present)
      )
    }
  })
}

// This function sends unused trackModules to the graveyard
function destroyTrackModule(trackModule) {
  trackModule.outputFinal.disconnect()
  trackModule.outputGain.disconnect()
  trackModule.outputPan.disconnect()
  trackModule.effectsChain.forEach(effect => effect.disconnect && effect.disconnect())
}

// This function births a new trackModule
function createTrackModule(engine, track, STORE) {
  let state = STORE.getState()
  // Used for MUTE / SOLO
  let outputFinal = engine.ctx.createGain()
      outputFinal.gain.value = 1.0
      outputFinal.connect(engine.masterGain)

  // Used for track GAIN
  let outputGain = engine.ctx.createGain()
      outputGain.gain.value = 1.0
      outputGain.connect(outputFinal)

  // Used for track PAN
  let outputPan = engine.ctx.createPanner()
      outputPan.setPosition(0,0,1)
      outputPan.connect(outputGain)

  // Used for track METER
  let outputMeter = engine.ctx.createAnalyser()
      outputMeter.fftSize = OUTPUT_METER_SIZE
      outputGain.connect(outputMeter)

  // Used for track METER
  let outputBuffer = new Uint8Array(OUTPUT_METER_SIZE)

  // Instantiate and wire up the plugins in the rack!
  let effectsChain = _.reverse(track.rack.slice()).reduce((rack, plugin) => {
    let source = new Plugins[plugin.id].Source(
      engine.ctx, plugin.config, STORE
    )

    if (rack[0]) source.connect(rack[0].getInputNode())
    else source.connect(outputPan)

    return [ source, ...rack ]
  }, [])

  let trackModule = {
    trackID: track.id,
    outputFinal,
    outputGain,
    outputPan,
    outputBuffer,
    outputMeter,
    effectsChain,
  }

  return trackModule
}

export function createMetronome(engine) {
  if (engine.metronome)
    return

  // Used for metronome volume
  let outputFinal = engine.ctx.createGain()
      outputFinal.gain.value = 1.0
      outputFinal.connect(engine.masterGain)

  // Used for amplitude envelope
  let envelope = engine.ctx.createGain()
      envelope.gain.value = 0.0
      envelope.connect(outputFinal)

  // Used for metronome sound
  let synth = engine.ctx.createOscillator()
      synth.frequency.value = 880
      synth.connect(envelope)
      synth.start(0)

  engine.metronome = {
    volume: outputFinal.gain,
    tick: (time = 0) => {
      time = Math.max(engine.ctx.currentTime, time) // Discrepancies to negative time will result in silence - mitigate!
      synth.frequency.setValueAtTime(880, time)
      envelope.gain.setTargetAtTime(0.8, time + 0.001, 0.001)
      envelope.gain.setTargetAtTime(0.0, time + 0.010, 0.001)
    },
    tock: (time = 0) => {
      time = Math.max(engine.ctx.currentTime, time) // Discrepancies to negative time will result in silence - mitigate!
      synth.frequency.setValueAtTime(440, time)
      envelope.gain.setTargetAtTime(1.0, time + 0.001, 0.001)
      envelope.gain.setTargetAtTime(0.0, time + 0.010, 0.001)
    },
    cancel: () => {
      envelope.gain.cancelScheduledValues(0)
      envelope.gain.setTargetAtTime(0, 0, 0.01)
    }
  }
}

export function getTrackOutputDecibels(engine, trackID) {
  let trackModule = engine.trackModules[trackID]
  if (trackModule) {
    let result = 0
    trackModule.outputMeter.getByteTimeDomainData(trackModule.outputBuffer)
    for (let i = 0; i < OUTPUT_METER_SIZE; i++) {
      let v = (trackModule.outputBuffer[i] - 128.0)/128
      result += v*v
    }
    result /= OUTPUT_METER_SIZE
    result = 20*Math.log(result)/Math.LN10
    result = result < -60 ? -Infinity : result
    return result
  }

  return null
}
