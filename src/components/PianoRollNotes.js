import React, { Component } from 'react';

export default class PianoRollNotes extends Component {
  render() {
    return (
      <div className="piano-roll-notes">
        {/*this.props.notes.map(function(note){
          return (<PianoRollNote />);
        })*/}
      </div>
    );
  }
}

PianoRollNotes.propTypes = {
  notes: React.PropTypes.array
};
