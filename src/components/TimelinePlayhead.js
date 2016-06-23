// ============================================================================
// Timeline Playhead
// ============================================================================
// This Component renders a playhead in any timeline, e.g. Mixer or Pianoroll.

import React, { Component } from 'react'

export default class TimelinePlayhead extends Component {

  render() {
    let playheadClasses = "timeline-playhead"
        playheadClasses += this.props.recording ? " recording" : ""
    let left = (this.props.playhead/this.props.barCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let playheadStyles = {
      display: this.props.playhead === null ? 'none' : 'block',
      left: left*100 + '%'
    }

    return (
      <div className="timeline-playhead-window">
        <div className="timeline-playhead-grid">
          <div className={playheadClasses} style={playheadStyles} />
        </div>
      </div>
    )
  }

}

TimelinePlayhead.propTypes = {
  barCount: React.PropTypes.number,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  playhead: React.PropTypes.number
}
