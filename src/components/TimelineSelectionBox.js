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

    let top    = (1 - Math.max(this.props.selectionStartY, this.props.selectionEndY)/this.props.yCount - this.props.yMin) / (this.props.yMax - this.props.yMin)
    let bottom = (1 - Math.min(this.props.selectionStartY, this.props.selectionEndY)/this.props.yCount - this.props.yMin) / (this.props.yMax - this.props.yMin)
    let left   = (Math.min(this.props.selectionStartX, this.props.selectionEndX)/this.props.xCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let right  = (Math.max(this.props.selectionStartX, this.props.selectionEndX)/this.props.xCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let width  = (right - left)*100 + '%';
    let height = (bottom - top)*100 + '%';
        top  =  top*100 + '%';
        left = left*100 + '%';
    let style = {top, left, width, height};

    return (
      <div className='timeline-selection-window'>
        <div className='timeline-selection-grid'>
          <div className='timeline-selection-box' style={style} />
        </div>
      </div>
    );
  }

}

TimelineSelectionBox.propTypes = {
  xCount: React.PropTypes.number,
  yCount: React.PropTypes.number,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  yMin: React.PropTypes.number,
  yMax: React.PropTypes.number,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number
};
