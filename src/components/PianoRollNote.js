import React, { Component } from 'react';

export default class PianoRollNote extends Component {
  render() {
    var noteStyle = {
      transform: "translate3d("+this.props.left + 0.0 + 'px,' + this.props.top + 1.0 + 'px,0)',
      // top: this.props.top + 1.0,
      // left: this.props.left + 0.0,
      width: this.props.width - 0.5,
      height: this.props.height - 1.0,
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
