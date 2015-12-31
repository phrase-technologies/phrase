import React, { Component } from 'react';

import PianoRollNote from './PianoRollNote';

export default class PianoRollNotes extends Component {
  render() {
    return (
      <div className="piano-roll-notes">
        {this.props.notes.map(function(note){

          let id     = note.id;
          let top    = (note.keyNum+1) / this.props.keyCount * 100 + 0.15;
          let bottom =  note.keyNum    / this.props.keyCount * 100 + 0.35;
          let left   =  note.start     / this.props.barCount * 100;
          let right  =  note.end       / this.props.barCount * 100;
          let width  = right - left;
          let height = top - bottom;
          let dispatch = this.props.dispatch
          let props  = {id, top, left, width, height, dispatch};

          return (<PianoRollNote key={note.id} {...props} />);

        }.bind(this))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return false;
    if(nextProps.notes === this.props.notes )
      return false;
    else
      return true;
  }
}

PianoRollNotes.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array
};
