// ============================================================================
// Timeline Selection Box
// ============================================================================
// This Component renders the selection box in the piano roll. 

import React, { Component } from 'react';

export default class TimelineSelectionBox extends Component {
  
  render() {
    if( this.props.selectionStartX == null || this.props.selectionEndX == null ||
        this.props.selectionStartY == null || this.props.selectionEndY == null )
      return null;

    let top    = Math.min(this.props.selectionStartY, this.props.selectionEndY) * 100;
    let bottom = Math.max(this.props.selectionStartY, this.props.selectionEndY) * 100;
    let left   = Math.min(this.props.selectionStartX, this.props.selectionEndX) * 100;
    let right  = Math.max(this.props.selectionStartX, this.props.selectionEndX) * 100;
    let width  = right - left + '%';
    let height = bottom - top + '%';
        top  += '%';
        left += '%';
    let style = {top, left, width, height};

    return (
      <div className='timeline-selection-window'>
        <div className='timeline-selection-area'>
          <div className='timeline-selection-box' style={style} />
        </div>
      </div>
    );
  }

}

TimelineSelectionBox.propTypes = {
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number
};
