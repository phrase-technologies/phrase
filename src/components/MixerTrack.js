import React, { Component } from 'react'

import { phraseArmTrack,
         phraseMuteTrack,
         phraseSoloTrack,
         phraseSelectTrack,
       } from '../reducers/reducePhrase.js'

import MixerTrackButton from './MixerTrackButton.js'
import MixerTrackLevel from './MixerTrackLevel.js'

export default class MixerTrack extends Component {

  render() {
    let mixerTrackClasses  = 'mixer-track'
        mixerTrackClasses += this.props.focused ? ' mixer-track-focused' : ''
        mixerTrackClasses += this.props.track.selected ? ' active' : ''

    let tagStyle = {
      backgroundColor: this.props.track.color
    }

    let buttonProps = {
      dispatch: this.props.dispatch,
      trackID: this.props.track.id
    }

    return (
      <div className={mixerTrackClasses}>
        <div
          className="mixer-track-control" ref={ref => this.control = ref}
          onClick={this.handleClick}
        >
          <div className="mixer-track-tag" style={tagStyle} />
          <h3 className="mixer-track-name">
            {this.props.track.name}
          </h3>
          <span className="mixer-track-caret fa fa-ellipsis-h" />
          <MixerTrackLevel track={this.props.track} atleastOneTrackSoloed={this.props.atleastOneTrackSoloed} />
          <MixerTrackButton buttonClasses="mixer-track-arm"
            active={this.props.track.arm} tooltip="Arm this track"
            action={phraseArmTrack} {...buttonProps}>
            <span className="fa fa-circle" />
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-mute"
            active={this.props.track.mute} tooltip="Mute this track"
            action={phraseMuteTrack} {...buttonProps}>
            <span>M</span>
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-solo"
            active={this.props.track.solo} tooltip="Solo this track"
            action={phraseSoloTrack} {...buttonProps}>
            <span>S</span>
          </MixerTrackButton>
        </div>
        <div className="mixer-track-window" />
      </div>
    )
  }

  handleClick = (e) => {
    // Don't intercept bubbled events from child buttons
    if (e.target !== this.control)
      return

    this.props.dispatch(phraseSelectTrack({ trackID: this.props.track.id, union: e.shiftKey }))
  }

}

MixerTrack.propTypes = {
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  track:        React.PropTypes.object.isRequired,
  focused:      React.PropTypes.bool
}
