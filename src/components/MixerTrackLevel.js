import React, { Component } from 'react'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

export class MixerTrackLevel extends Component {

  percentFromDb(dB) {
    return dB < -60 ? 0 : 100 * (dB + 60) / 60
  }

  render() {
    let muteTrack = this.props.atleastOneTrackSoloed && !this.props.track.solo || this.props.track.mute
    let trackLevelClass = "mixer-track-level"
        trackLevelClass += muteTrack ? " mixer-track-level-muted" : ''
    let left = this.percentFromDb(this.state.dB)
    let right = this.percentFromDb(this.state.maxDb.level)
    let width = right > left ? right - left - 2 : 0
    let leftLimitStyle = {
      left: `${left}%`,
      width: `${width}%`
    }
    let rightLimitStyle = {
      left: `${right}%`
    }

    return (
      <div className={trackLevelClass}>
        <div className="mixer-track-meter" style={leftLimitStyle} />
        <div className="mixer-track-meter" style={rightLimitStyle} />
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

  componentWillMount() {
    this.state = { maxDb: { level: -Infinity, expiry: null }}
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

    let shouldUpdate = false
    let dB = Math.round(this.props.ENGINE.getTrackOutputDecibels(this.props.track.id) * 100) / 100
    let now = Date.now()
    if (dB > -Infinity && dB >= this.state.maxDb.level) {
      this.setState({ maxDb: { level: dB, expiry: now + 3000 }})
      shouldUpdate = true
    }
    else if (this.state.maxDb.expiry && this.state.maxDb.expiry < now) {
      if(dB > -Infinity)
        this.setState({ maxDb: { level: dB, expiry: now + 3000 }})
      else
        this.setState({ maxDb: { level: -Infinity, expiry: null}})
      shouldUpdate = true
    }

    if (dB !== this.state.dB) {
      shouldUpdate = true
      this.setState({ dB })
    }


    if (shouldUpdate)
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
