import React, { Component } from 'react';
import { connect } from 'react-redux';
import { transportAction,
         TRANSPORT_PLAY,
         TRANSPORT_STOP,
         TRANSPORT_REWIND,
         TRANSPORT_RECORD
       } from '../actions/actions.js';
import TransportButton from './TransportButton';

export default class Transport extends Component {
  render() {
    var { playing, armedForRecording, transportStop, transportPlay, transportRecord } = this.props;
    return (
      <div className="transport ">
        <div className="btn-group">
          <TransportButton type="fast-backward" toggle={false}    />
          <TransportButton type="stop"          toggle={!playing}           onButtonClick={transportStop} />
          <TransportButton type="play"          toggle={playing}            onButtonClick={transportPlay}   color="green" />
          <TransportButton type="circle"        toggle={armedForRecording}  onButtonClick={transportRecord} color="red"   />
          <TransportButton type="refresh"       toggle={false}    />
        </div>        
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    playing: state.transportControls.playing,
    armedForRecording: state.transportControls.armedForRecording
  };
}

function mapDispatchToProps(dispatch) {
  return {
    transportPlay:   () => dispatch(transportAction(TRANSPORT_PLAY)),
    transportStop:   () => dispatch(transportAction(TRANSPORT_STOP)),
    transportRecord: () => dispatch(transportAction(TRANSPORT_RECORD))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Transport);