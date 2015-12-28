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
    return (
      <div className="piano-roll-notes">
        {this.props.notes.map(function(note){

          let id     = note.id;
          let top    = this.keyToYCoord(note.keyNum) / this.data.pixelScale;
          let left   = this.barToXCoord(note.start) / this.data.pixelScale;
          let right  = this.barToXCoord(note.end) / this.data.pixelScale
          let bottom = this.keyToYCoord(note.keyNum+1) / this.data.pixelScale;
          let width  = right - left;
          let height = bottom - top;
          let props  = {id, top, height, left, width};

          if( left < this.data.width && right > 0 )
            return (<PianoRollNote key={note.id} {...props} />);
          else
            return null;

        }.bind(this))}
      </div>
    );
  }
}

PianoRollNotes.propTypes = {
  notes: React.PropTypes.array
};
