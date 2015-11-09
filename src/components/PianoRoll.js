import React, { Component } from 'react';
import PianoRollTimeline    from './PianoRollTimeline';
import PianoRollNotes       from './PianoRollNotes';
import PianoRollKeyboard    from './PianoRollKeyboard';
import PianoRollScroll      from './PianoRollScroll';

class Note {

}

export default class PianoRoll extends Component {
  render() {
    return (
      <div className="piano-roll">
        <PianoRollTimeline
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          keyMin={this.props.keyMin}
          keyMax={this.props.keyMax}
          />
        <PianoRollNotes />
        <PianoRollKeyboard />
        <PianoRollScroll />
      </div>
    );
  }
}

PianoRoll.propTypes = {
  notes:    React.PropTypes.arrayOf(React.PropTypes.instanceOf(Note)),
  cursor:   React.PropTypes.number,
  playHead: React.PropTypes.number
};
PianoRoll.defaultProps = {
  notes:    [],
  cursor:   0.000,
  playHead: 0.000
};
