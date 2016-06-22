import React from 'react'

import { connect } from 'react-redux'

import { transportPlayToggle,
         transportRewindPlayhead,
         transportAdvancePlayhead,
         transportStop,
         transportRecord } from '../reducers/reduceTransport.js'

import TransportButton from './TransportButton'

let TransportControls = (props) => {
  let { dispatch, playing, playhead, recording } = props
  let stopType = !playhead || playing ? "stop" : "step-backward"
  let stopTooltip = !playhead || playing ? "Stop Playback (Enter)" : "Return to beginning (Enter)"
  let playTooltip = playing ? "Pause (Space)" : "Play (Space)"

  return (
    <div className="btn-group">
      <TransportButton type="backward" toggle={false}      onButtonClick={() => dispatch(transportRewindPlayhead())}           tooltip="Rewind Playhead (<)" />
      <TransportButton type="forward"  toggle={false}      onButtonClick={() => dispatch(transportAdvancePlayhead())}          tooltip="Advance Playhead (>)" />
      <TransportButton type={stopType} toggle={false}      onButtonClick={() => dispatch(transportStop())}                     tooltip={stopTooltip} />
      <TransportButton type="play"     toggle={playing}    onButtonClick={() => dispatch(transportPlayToggle())} color="green" tooltip={playTooltip} />
      <TransportButton type="circle"   toggle={recording}  onButtonClick={() => dispatch(transportRecord())}     color="red"   tooltip="Record (R) [TODO]" />
    </div>
  )
}

function mapStateToProps(state) {
  return {
    playing:   state.transport.playing,
    recording: state.transport.recording,
    playhead:  state.transport.playhead,
  }
}

export default connect(mapStateToProps)(TransportControls)
