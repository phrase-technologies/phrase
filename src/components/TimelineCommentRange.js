// ============================================================================
// Timeline Comment Range
// ============================================================================
// This Component renders a comment range in any timeline, e.g. Mixer or Pianoroll.

import React, { Component } from 'react'

export default class TimelineCommentRange extends Component {

  render() {
    let left = (this.props.commentRangeStart/this.props.barCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let right = (this.props.commentRangeEnd/this.props.barCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let commentRangeStyles = {
      display: this.props.commentRangeStart === null ? 'none' : 'block',
      left:     left   * 100 + '%',
      right: (1-right) * 100 + '%',
    }

    return (
      <div className="timeline-comment-range-window">
        <div className="timeline-comment-range-grid">
          <div className="timeline-comment-range" style={commentRangeStyles}>
          </div>
        </div>
      </div>
    )
  }

}

TimelineCommentRange.propTypes = {
  barCount: React.PropTypes.number,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  commentRangeStart: React.PropTypes.number,
  commentRangeEnd: React.PropTypes.number,
}
