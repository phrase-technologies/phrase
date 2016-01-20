import React, { Component } from 'react';
import MixerTrackWindow from './MixerTrackWindow.js';

export default class MixerTrack extends Component {
  render() {
    return (
      <div className="mixer-track">
        <div className="mixer-track-tag" />
        <div className="mixer-track-control">
          <h3 className="mixer-track-name">
            {this.props.track.name}
          </h3>
          <span className="mixer-track-caret fa fa-ellipsis-h" />
          <div className="mixer-track-gain" />
          <div className="mixer-track-meter" />
          <button className="mixer-track-btn mixer-track-arm">
            <span className="fa fa-circle" />
          </button>
          <button className="mixer-track-btn mixer-track-mute">
            <span>M</span>
          </button>
          <button className="mixer-track-btn mixer-track-solo">
            <span>S</span>
          </button>
        </div>
        <MixerTrackWindow
          clips={this.props.track.clips}
          barCount={this.props.barCount}
          xMin={this.props.xMin}
          xMax={this.props.xMax}
          dispatch={this.props.dispatch}
        />
      </div>
    );
  }
}

MixerTrack.propTypes = {
  track:        React.PropTypes.object.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  xMin:       React.PropTypes.number.isRequired,
  xMax:       React.PropTypes.number.isRequired
};  
