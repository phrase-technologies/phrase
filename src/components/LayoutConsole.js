import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX } from '../actions/actions.js';
import MixerTimeline from './MixerTimeline.js';
import MixerWindow from './MixerWindow.js';
import Transport from './Transport.js';

export default class LayoutConsole extends Component {
  render() {
    return (
      <div className="layout-console">
        <Transport />
        <MixerTimeline
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          dispatch={this.props.dispatch}
        />
        <MixerWindow />
        <div className="mixer-timeline-overlay" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    barMin: state.pianoRoll.barMin,
    barMax: state.pianoRoll.barMax
  };
}

export default connect(mapStateToProps)(LayoutConsole);
