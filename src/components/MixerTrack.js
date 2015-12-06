import React, { Component } from 'react';

export default class MixerTrack extends Component {
  render() {
    return (
      <div className="mixer-track">
        <div className="mixer-track-tag" />
        <div className="mixer-track-control">
          <h3 className="mixer-track-name">
            Track Name
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
        <div className="mixer-track-window" />
      </div>
    );
  }
}

MixerTrack.propTypes = {
};
