import React from 'react'
import { connect } from 'react-redux'

import TransportTempo from './TransportTempo'
import TransportButton from './TransportButton'

import {
  transportPlayToggle,
  transportRewindPlayhead,
  transportAdvancePlayhead,
  transportStop,
  transportRecord,
  transportCountIn,
  transportMetronome,
} from '../reducers/reduceTransport.js'

let TransportControls = (props) => {
  let { dispatch, playing, playhead, recording, countIn, metronome } = props
  let stopType = !playhead || playing ? "stop" : "step-backward"
  let stopTooltip = !playhead || playing ? "Stop Playback (Enter)" : "Return to beginning (Enter)"
  let playTooltip = playing ? "Pause (Space)" : "Play (Space)"

  return (
    <div className="btn-toolbar" style={props.style}>
      <TransportTempo />
      <div className="btn-group">
        <TransportButton
          onButtonClick={() => dispatch(transportRewindPlayhead())}
          toggle={false} tooltip="Rewind Playhead (<)"
        >
          <i className="fa fa-fw fa-backward" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportAdvancePlayhead())}
          toggle={false} tooltip="Advance Playhead (>)"
        >
          <i className="fa fa-fw fa-forward" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportStop())}
          toggle={false} tooltip={stopTooltip}
        >
          <i className={`fa fa-fw fa-${stopType}`} />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportPlayToggle())}
          toggle={playing} color="green" tooltip={playTooltip}
        >
          <i className="fa fa-fw fa-play" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportRecord())}
          toggle={recording} color="red" tooltip="Record (R)"
        >
          <i className="fa fa-fw fa-circle" />
        </TransportButton>
      </div>
      <div className="btn-group">
        <TransportButton
          onButtonClick={() => dispatch(transportCountIn())}
          toggle={countIn} tooltip="Count In (⇧M)" narrow={true} link={true}
        >
          <span style={{ fontSize:  8 }}>1</span>
          <span style={{ fontSize: 10 }}>2</span>
          <span style={{ fontSize: 12 }}>3</span>
          <span style={{ fontSize: 14 }}>4</span>
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportMetronome())}
          toggle={metronome} tooltip='Metronome (M)' narrow={true} link={true}
        >
          <i className="phrase-icon-metronome" />
        </TransportButton>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    ...state.transport,
  }
}

export default connect(mapStateToProps)(TransportControls)
