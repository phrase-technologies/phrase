// ============================================================================
// Timeline Playhead
// ============================================================================
// This Component renders a playhead in any timeline, e.g. Mixer or Pianoroll. 

import React, { Component } from 'react';

export default class TimelinePlayhead extends Component {
  
  render() {
    var playheadStyles = {
      display: this.props.playhead === null ? 'none' : 'block',
      left: this.props.playhead === null ? 0 : 100*this.props.playhead + '%'
    };

    return (
      <div className="timeline-playhead-window">
        <div className="timeline-playhead" style={playheadStyles} />
      </div>
    );
  }

}

TimelinePlayhead.propTypes = {
  playhead: React.PropTypes.number
};
