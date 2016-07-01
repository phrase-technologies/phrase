import React, { Component } from 'react'

import {
  phraseMuteTrack,
  phraseSoloTrack,
  phraseSelectTrack,
} from '../reducers/reducePhrase.js'
import { getDarkenedColor } from '../helpers/trackHelpers.js'

import MixerTrackButton from './MixerTrackButton.js'
import MixerTrackLevel from './MixerTrackLevel.js'

export default class MixerTrack extends Component {

  render() {
    let mixerTrackClasses  = 'mixer-track'
        mixerTrackClasses += this.props.track.selected ? ' active' : ''

    let controlStyle = {
      backgroundColor: this.props.track.color,
      backgroundImage: `linear-gradient(to bottom, ${this.props.track.color}, ${getDarkenedColor(this.props.track.color, 0.266)})`,
    }
    let nameStyle = this.props.track.selected
      ? {
        color: this.props.track.color,
        backgroundImage: `linear-gradient(to bottom, ${getDarkenedColor(this.props.track.color, 0.533)}, ${getDarkenedColor(this.props.track.color, 0.733)})`,
      } : {}
    let buttonProps = {
      dispatch: this.props.dispatch,
      trackID: this.props.track.id
    }
    let thumbnailStyle = {
      backgroundImage: `url(${require('img/piano.jpg')})`,
    }

    return (
      <div className={mixerTrackClasses}>
        <div
          className="mixer-track-control" ref={ref => this.control = ref}
          onClick={this.handleClick} style={controlStyle}
        >
          <div className="mixer-track-thumbnail" style={thumbnailStyle} />
          <h3 className="mixer-track-name" style={nameStyle}>
            {this.props.track.name}
          </h3>
          <span className="mixer-track-caret fa fa-ellipsis-h" />
          <MixerTrackLevel track={this.props.track} atleastOneTrackSoloed={this.props.atleastOneTrackSoloed} />
          <MixerTrackButton buttonClasses="mixer-track-arm"
            active={this.props.track.selected} tooltip="Arm this track"
            action={this.armTrack} {...buttonProps}>
            <span className="fa fa-circle" />
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-mute"
            active={this.props.track.mute} tooltip="Mute this track"
            action={this.muteTrack} {...buttonProps}>
            <span>M</span>
          </MixerTrackButton>
          <MixerTrackButton buttonClasses="mixer-track-solo"
            active={this.props.track.solo} tooltip="Solo this track"
            action={this.soloTrack} {...buttonProps}>
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

    this.armTrack(e)
  }

  armTrack = (e) => {
    this.props.dispatch(phraseSelectTrack({ trackID: this.props.track.id, union: e.shiftKey }))
  }

  muteTrack = () => {
    this.props.dispatch(phraseMuteTrack(this.props.track.id))
  }

  soloTrack = () => {
    this.props.dispatch(phraseSoloTrack(this.props.track.id))
  }

}

MixerTrack.propTypes = {
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  track:        React.PropTypes.object.isRequired,
  focused:      React.PropTypes.bool
}
