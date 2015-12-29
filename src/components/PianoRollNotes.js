import React from 'react';
import TimelineBase from './TimelineBase';

import PianoRollNote from './PianoRollNote';

export default class PianoRollNotes extends TimelineBase {

  constructor() {
    super();
    this.data.marginTop    =  0;
    this.data.marginBottom = 30;
    this.data.marginLeft   = 10;
    this.data.marginRight  = 10;
  }

  render() {
    let xWindowPercent = (this.props.barMax - this.props.barMin);
    let activeWidth = this.getActiveWidth() / this.data.pixelScale;
    var sliderStyle = {
      left:  -1 * (    this.props.barMin) / xWindowPercent * activeWidth + this.data.marginLeft,
      right: -1 * (1 - this.props.barMax) / xWindowPercent * activeWidth + this.data.marginRight
    };

    return (
      <div className="piano-roll-notes-wrapper">
        <div className="piano-roll-notes-slider" style={sliderStyle}>
          {this.props.notes.map(function(note){

            let id     = note.id;
            let top    = (    (note.keyNum+1) / this.props.keyCount ) * 100 + '%';
            let bottom = (1 -  note.keyNum    / this.props.keyCount ) * 100 + '%';
            let left   = (     note.start     / this.props.barCount ) * 100 + '%';
            let right  = (1 -  note.end       / this.props.barCount ) * 100 + '%';
            let props  = {id, top, left, right, bottom};

            return (<PianoRollNote key={note.id} {...props} />);

          }.bind(this))}
        </div>
      </div>
    );
  }

  handleResize() {
    super.handleResize();
    this.forceUpdate();
  }
}

PianoRollNotes.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired,
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array
};
