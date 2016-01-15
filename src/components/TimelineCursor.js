// ============================================================================
// Timeline Cursor
// ============================================================================
// This Component renders a cursor in any timeline, e.g. Mixer or Pianoroll. 

import React, { Component } from 'react';

export default class TimelineCursor extends Component {
  
  render() {
    var cursorStyles = {
      display: this.props.cursor === null ? 'none' : 'block',
      left: this.props.cursor === null ? 0 : 100*this.props.cursor + '%'
    };

    return (
      <div className="timeline-cursor-window">
        <div className="timeline-cursor" style={cursorStyles} />
      </div>
    );
  }

}

TimelineCursor.propTypes = {
  cursor: React.PropTypes.number
};
