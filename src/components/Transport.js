import React, { Component } from 'react';
import { connect } from 'react-redux';
import { transportAction, TRANSPORT_PLAY, TRANSPORT_STOP, TRANSPORT_REWIND } from '../actions/actions.js';
import TransportButton from './TransportButton';

export default class Transport extends Component {
  render() {
    var { playing, transportStop, transportPlay } = this.props;
    return (
      <div className="transport ">
        <div className="btn-group">
          <TransportButton type="fast-backward" toggle={false}    />
          <TransportButton type="stop"          toggle={!playing} onButtonClick={transportStop} />
          <TransportButton type="play"          toggle={playing}  onButtonClick={transportPlay} />
          <TransportButton type="circle"        toggle={false}    />
          <TransportButton type="refresh"       toggle={false}    />
        </div>        
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    playing: state.transportControls.playing
  };
}

function mapDispatchToProps(dispatch) {
  return {
    transportPlay: () => dispatch(transportAction(TRANSPORT_PLAY)),
    transportStop: () => dispatch(transportAction(TRANSPORT_STOP))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Transport);