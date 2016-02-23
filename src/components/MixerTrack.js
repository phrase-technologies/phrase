import React, { Component } from 'react';

import MixerTrackArm  from './MixerTrackArm.js';
import MixerTrackMute from './MixerTrackMute.js';
import MixerTrackSolo from './MixerTrackSolo.js';

export default class MixerTrack extends Component {
  render() {
    var mixerTrackClasses  = "mixer-track"
        mixerTrackClasses += this.props.focused ? " mixer-track-focused" : ""

    var tagStyle = {
      backgroundColor: this.props.track.color
    }

    var buttonProps = {
      dispatch: this.props.dispatch,
      trackID: this.props.track.id
    }

    return (
      <div className={mixerTrackClasses}>
        <div className="mixer-track-tag" style={tagStyle} />
        <div className="mixer-track-control">
          <h3 className="mixer-track-name">
            {this.props.track.name}
          </h3>
          <span className="mixer-track-caret fa fa-ellipsis-h" />
          <div className="mixer-track-gain" />
          <div className="mixer-track-meter" />
          <MixerTrackArm   arm={this.props.track.arm}  {...buttonProps} />
          <MixerTrackMute mute={this.props.track.mute} {...buttonProps} />
          <MixerTrackSolo solo={this.props.track.solo} {...buttonProps} />
        </div>
        <div className="mixer-track-window" />
      </div>
    )
  }
}

MixerTrack.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  track:        React.PropTypes.object.isRequired,
  focused:      React.PropTypes.bool
}
