import React, { Component } from 'react'

import { connect } from 'react-redux'

import { transportPlayToggle,
         transportStop,
         transportRecord } from '../reducers/reduceTransport.js'

import TransportButton from './TransportButton'

class Transport extends Component {

  constructor() {
    super()
    this.state = {
      tempo: 128
    }
  }

  render() {
    let { dispatch, playing, recording } = this.props
    return (
      <div className="transport btn-toolbar">
        <div className="btn-group">
          <div className="transport-tempo-container">
            <input className="form-control form-control-glow transport-tempo"
              type="number" min={1} max={999} step={1} defaultValue={120}
            />
            <span>BPM</span>
          </div>
        </div>
        {/*
        <div className="btn-group" style={{ width: 120 }}>
          <input type="number" className="form-control form-control-glow transport-time-a" value={1} />
          .
          <input type="number" className="form-control form-control-glow transport-time-b" value={1} />
          .
          <input type="number" className="form-control form-control-glow transport-time-c" value={1} />
          .
          <input type="number" className="form-control form-control-glow transport-time-d" value={10} />
        </div>
        */}
        <div className="btn-group">
          <TransportButton type="step-backward" toggle={false}    />
          <TransportButton type="backward"      toggle={false}    />
          <TransportButton type="forward"       toggle={false}    />
          <TransportButton type="stop"          toggle={!playing}   onButtonClick={() => dispatch(transportStop())} />
          <TransportButton type="play"          toggle={playing}    onButtonClick={() => dispatch(transportPlayToggle())} color="green" />
          <TransportButton type="circle"        toggle={recording}  onButtonClick={() => dispatch(transportRecord())}     color="red"   />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    playing:   state.transport.playing,
    recording: state.transport.recording
  }
}

export default connect(mapStateToProps)(Transport)
