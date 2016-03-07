import React, { Component } from 'react';
import { connect, dispatch } from 'react-redux';

import { transportPlayToggle,
         transportStop,
         transportRecord } from '../actions/actionsTransport.js';

import TransportButton from './TransportButton';

export default class Transport extends Component {
  render() {
    var { dispatch, playing, recording } = this.props;
    return (
      <div className="transport ">
        <div className="btn-group">
          <TransportButton type="step-backward" toggle={false}    />
          <TransportButton type="backward"      toggle={false}    />
          <TransportButton type="forward"       toggle={false}    />
          <TransportButton type="stop"          toggle={!playing}   onButtonClick={() => dispatch(transportStop())} />
          <TransportButton type="play"          toggle={playing}    onButtonClick={() => dispatch(transportPlayToggle())} color="green" />
          <TransportButton type="circle"        toggle={recording}  onButtonClick={() => dispatch(transportRecord())}     color="red"   />
        </div>        
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    playing:   state.transport.playing,
    recording: state.transport.recording
  };
}

export default connect(mapStateToProps)(Transport);