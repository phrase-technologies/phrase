import React, { Component } from 'react';

export default class PianoRollNote extends Component {
  render() {

    var noteStyle = {
      top: this.props.top,
      left: this.props.left,
      right: this.props.right,
      bottom: this.props.bottom
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
