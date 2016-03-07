import React, { Component } from 'react'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

import { getDarkenedColor } from '../helpers/trackHelpers.js'

export class MixerTrackMeter extends Component {

  render() {
    var muteTrack = this.props.atleastOneTrackSoloed && !this.props.track.solo || this.props.track.mute
    var trackColor = muteTrack ? "#888" : this.props.track.color
    var shadedColor = getDarkenedColor( trackColor, 0.25 )
    var meterStyle = {
      // background: this.props.track.color
      backgroundImage: `linear-gradient(to right, ${shadedColor} 0%, ${trackColor} 80%)`//, #FFF 100%)`
    }
    var dB = this.props.ENGINE.getTrackOutputDecibels(this.props.track.id)
    var left = dB < -60 ? 0 : 100*(dB + 60)/60
    var limitStyle = {
      left: left+'%'
    }

    return (
      <div className="mixer-track-meter" style={meterStyle}>
        <div className="mixer-track-meter-limit" style={limitStyle} />
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

MixerTrackMeter.propTypes = {
  ENGINE: engineShape.isRequired,
  track:  React.PropTypes.object.isRequired,
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired
}

export default connectEngine( MixerTrackMeter )