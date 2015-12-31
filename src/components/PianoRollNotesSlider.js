import React, { Component } from 'react';

import PianoRollNotes from './PianoRollNotes';

export default class PianoRollNotesSlider extends Component {
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
      <div className="piano-roll-notes-wrapper">
        <div className="piano-roll-notes-slider" style={sliderStyle}>
          <PianoRollNotes
            notes={this.props.notes}
            dispatch={this.props.dispatch}
            barCount={this.props.barCount}
            keyCount={this.props.keyCount}
          />
        </div>
      </div>
    );
  }
}

PianoRollNotesSlider.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired,
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array
};
