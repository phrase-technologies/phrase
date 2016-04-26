import React, { Component } from 'react'

import { phraseArmTrack,
         phraseMuteTrack,
         phraseSoloTrack } from '../reducers/reducePhrase.js'

import MixerTrackButton from './MixerTrackButton.js'
import MixerTrackMeter  from './MixerTrackMeter.js'

export default class MixerTrack extends Component {
  render() {
    let mixerTrackClasses  = 'mixer-track'
        mixerTrackClasses += this.props.focused ? ' mixer-track-focused' : ''

    let tagStyle = {
      backgroundColor: this.props.track.color
    }

    let buttonProps = {
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
          <MixerTrackMeter track={this.props.track} atleastOneTrackSoloed={this.props.atleastOneTrackSoloed} />
          <MixerTrackButton buttonClasses="mixer-track-arm"
            active={this.props.track.arm}
            action={phraseArmTrack} {...buttonProps}>
            <span className="fa fa-circle" />
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-mute"
            active={this.props.track.mute}
            action={phraseMuteTrack} {...buttonProps}>
            <span>M</span>
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-solo"
            active={this.props.track.solo}
            action={phraseSoloTrack} {...buttonProps}>
            <span>S</span>
          </MixerTrackButton>
        </div>
        <div className="mixer-track-window" />
      </div>
    )
  }
}

MixerTrack.propTypes = {
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  track:        React.PropTypes.object.isRequired,
  focused:      React.PropTypes.bool
}
