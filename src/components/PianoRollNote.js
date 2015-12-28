import React, { Component } from 'react';

export default class PianoRollNote extends Component {
  render() {
    var noteStyle = {
      
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
