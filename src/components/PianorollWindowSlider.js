import React, { Component } from 'react';

import PianorollClips from './PianorollClips';
import PianorollNotes from './PianorollNotes';
import TimelineSelectionBox from './TimelineSelectionBox';

export default class PianorollWindowSlider extends Component {
  render() {
    let xWindowPercent = (this.props.xMax - this.props.xMin);
    let yWindowPercent = (this.props.yMax - this.props.yMin);
    let top  = -100 * this.props.yMin;
    let left = -100 * this.props.xMin;
    let xScale = 100 / xWindowPercent + '%';
    let yScale = 100 / yWindowPercent + '%';
    var sliderStyle = {
      transform: 'translate3d('+left+'%,'+top+'%,1px)',
      transformOrigin: '0 100 0',
      width: xScale,
      height: yScale
    };

    return (
      <div className="pianoroll-window">
        <div className="pianoroll-window-sill">
          <div className="pianoroll-window-slider" style={sliderStyle} ref={(ref) => this.slider = ref}>
            <PianorollClips
              clips={this.props.clips}
              dispatch={this.props.dispatch}
              barCount={this.props.barCount}
            />
            <PianorollNotes
              notes={this.props.notes}
              dispatch={this.props.dispatch}
              barCount={this.props.barCount}
              keyCount={this.props.keyCount}
            />
            <TimelineSelectionBox
              selectionStartX={this.props.selectionStartX}
              selectionStartY={this.props.selectionStartY}
              selectionEndX={this.props.selectionEndX}
              selectionEndY={this.props.selectionEndY}
            />
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    // Element Queries (global) used to hide/show note labels depending on zoom
    if(ElementQueries)
      ElementQueries.init();
  }
}

PianorollWindowSlider.propTypes = {
  barCount: React.PropTypes.number.isRequired,
  keyCount: React.PropTypes.number.isRequired,
  xMin: React.PropTypes.number.isRequired,
  xMax: React.PropTypes.number.isRequired,
  yMin: React.PropTypes.number.isRequired,
  yMax: React.PropTypes.number.isRequired,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number,
  clips: React.PropTypes.array,
  notes: React.PropTypes.array
};
