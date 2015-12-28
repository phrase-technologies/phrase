import React, { Component } from 'react';

export default class PianoRollNote extends Component {
  render() {
    var noteStyle = {
      top: this.props.top,
      left: this.props.left,
      width: this.props.width,
      height: this.props.height,
    };

    return (
      <div className="piano-roll-note" style={noteStyle}>
      </div>
    );
  }
}

PianoRollNote.propTypes = {
  notes: React.PropTypes.array
};
