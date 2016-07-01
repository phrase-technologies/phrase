import React, { Component } from 'react'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

export class MixerTrackLevel extends Component {

  render() {
    let muteTrack = this.props.atleastOneTrackSoloed && !this.props.track.solo || this.props.track.mute
    let trackLevelClass = "mixer-track-level"
        trackLevelClass += muteTrack ? " mixer-track-level-muted" : ''
    let dB = this.props.ENGINE.getTrackOutputDecibels(this.props.track.id)
    let left = dB < -60 ? 0 : 100*(dB + 60)/60
    let limitStyle = {
      left: left+'%'
    }

    return (
      <div className={trackLevelClass}>
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
