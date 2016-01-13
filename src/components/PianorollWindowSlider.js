import React, { Component } from 'react';

import PianorollSelectionBox from './PianorollSelectionBox';
import PianorollClips from './PianorollClips';
import PianorollNotes from './PianorollNotes';

export default class PianorollWindowSlider extends Component {
  render() {
    let xWindowPercent = (this.props.barMax - this.props.barMin);
    let yWindowPercent = (this.props.keyMax - this.props.keyMin);
    let top  = -100 * this.props.keyMin;
    let left = -100 * this.props.barMin;
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
          <PianorollSelectionBox
            selectionStartX={this.props.selectionStartX}
            selectionStartY={this.props.selectionStartY}
            selectionEndX={this.props.selectionEndX}
            selectionEndY={this.props.selectionEndY}
          />
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
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired,
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number,
  notes:        React.PropTypes.array
};
