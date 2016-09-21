import React from 'react'
import { connect } from 'react-redux'

// ============================================================================
// Timeline Comment Range
// ============================================================================
// This Component renders a comment range in any timeline, e.g. Mixer or Pianoroll.
export let TimelineCommentRange = (props) => {
  let left = (props.commentRangeStart/props.barCount - props.xMin) / (props.xMax - props.xMin)
  let right = (props.commentRangeEnd/props.barCount - props.xMin) / (props.xMax - props.xMin)
  // For no selection, show entire range selected!
  if (props.commentRangeStart === null) {
    left = -0.1
    right = 1.1
  // If no endpoint shown, it's just a line. Match the two ends to the same line!
  } else if (props.commentRangeEnd === null) {
    right = left
  // If selection was made in reverse order, flip it!
  } else if (left > right) {
    [left, right] = [right, left]
  }

  let commentRangeStyles = {
    display: props.arrangeTool === "comment" ? 'block' : 'none',
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

TimelineCommentRange.propTypes = {
  barCount: React.PropTypes.number,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  commentRangeStart: React.PropTypes.number,
  commentRangeEnd: React.PropTypes.number,
  arrangeTool: React.PropTypes.string,
}

function mapStateToProps(state) {
  return {
    ...state.comment,
    arrangeTool: state.arrangeTool,
  }
}

export default connect(mapStateToProps)(TimelineCommentRange)
