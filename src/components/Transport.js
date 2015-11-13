import React, { Component } from 'react';
import { connect, dispatch } from 'react-redux';
import { transportPlay,
         transportStop,
         transportRecord,
       } from '../actions/actions.js';
import TransportButton from './TransportButton';

export default class Transport extends Component {
  render() {
    var { dispatch, playing, recording } = this.props;
    return (
      <div className="transport ">
        <div className="btn-group">
          <TransportButton type="fast-backward" toggle={false}    />
          <TransportButton type="stop"          toggle={!playing}   onButtonClick={() => dispatch(transportStop())} />
          <TransportButton type="play"          toggle={playing}    onButtonClick={() => dispatch(transportPlay())}   color="green" />
          <TransportButton type="circle"        toggle={recording}  onButtonClick={() => dispatch(transportRecord())} color="red"   />
          <TransportButton type="refresh"       toggle={false}    />
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