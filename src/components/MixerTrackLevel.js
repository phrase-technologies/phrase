import React, { Component } from 'react'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

import { getDarkenedColor } from '../helpers/trackHelpers.js'

export class MixerTrackLevel extends Component {

  render() {
    let muteTrack = this.props.atleastOneTrackSoloed && !this.props.track.solo || this.props.track.mute
    let trackColor = muteTrack ? '#888' : this.props.track.color
    let shadedColor = getDarkenedColor(trackColor, 0.25)
    let meterStyle = {
      // background: this.props.track.color
      backgroundImage: `linear-gradient(to right, ${shadedColor} 0%, ${trackColor} 80%)`//, #FFF 100%)`
    }
    let dB = this.props.ENGINE.getTrackOutputDecibels(this.props.track.id)
    let bottom = dB < -60 ? 0 : 100*(dB + 60)/60
    let limitStyle = {
      bottom: bottom+'%'
    }

    return (
      <div className="mixer-track-level" style={meterStyle}>
        <div className="mixer-track-meter" style={limitStyle} />
      </div>
    )
  }

  constructor() {
    super(...arguments)
    this.renderMeter = this.renderMeter.bind(this)
  }

  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    this.renderMeter()
  }

  componentWillUnmount() {
    this.unmounted = true
  }

  renderMeter() {
    if (this.unmounted)
      return

    this.forceUpdate()
    requestAnimationFrame(this.renderMeter)
  }

}

MixerTrackLevel.propTypes = {
  ENGINE: engineShape.isRequired,
  track:  React.PropTypes.object.isRequired,
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired
}

export default connectEngine(MixerTrackLevel)
