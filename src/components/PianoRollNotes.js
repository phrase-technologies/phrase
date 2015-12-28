import React from 'react';
import TimelineBase from './TimelineBase';

import PianoRollNote from './PianoRollNote';

export default class PianoRollNotes extends TimelineBase {

  render() {
    return (
      <div className="piano-roll-notes">
        {this.props.notes.map(function(note){
          //console.log( note.keyNum, this.keyToYCoord(note.keyNum) );

          return (<PianoRollNote key={note.id} {...note} />);
        }.bind(this))}
      </div>
    );
  }
}

PianoRollNotes.propTypes = {
  notes: React.PropTypes.array
};
