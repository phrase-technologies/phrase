import SynthPoly from './SynthPoly.js'

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

  // Add tracks as required
  state.phrase.tracks.forEach(track => {
    if (!engine.trackModules[track.id]) {
      engine.trackModules[track.id] = createTrackModule(engine, track)
    }
  })

  // Update tracks that have changed
  // ...
  // Track Volume
}

// This function births a new trackModule
function createTrackModule(engine, track) {
  var outputGain = engine.ctx.createGain()
      outputGain.connect(engine.masterGain)

  var synth = new SynthPoly(engine.ctx)
      synth.connect(outputGain)

  var effectsChain = [
    synth
  ]

  var trackModule = {
    trackID: track.id,
    outputGain: outputGain,
    effectsChain: effectsChain
  }

  return trackModule
}

// This function sends unused trackModules to the graveyard
function destroyTrackModule(trackModule) {
  trackModule.outputGain.disconnect()
  trackModule.effectsChain.forEach(effect => effect.disconnect())
}