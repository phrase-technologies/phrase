import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY } from '../actions/actions.js';
import PianoRollTimeline    from './PianoRollTimeline.js';
import PianoRollWindow      from './PianoRollWindow.js';
import PianoRollNotes       from './PianoRollNotes.js';
import PianoRollKeyboard    from './PianoRollKeyboard.js';
import Scrollbar            from './Scrollbar.js';

export default class PianoRoll extends Component {

  constructor() {
    super();
    this.data = {};
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

  render() {
    return (
      <div className="piano-roll">
        <PianoRollTimeline ref={(ref) => this.timeline = ref}
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          barCount={this.props.barCount} 
          dispatch={this.props.dispatch}
          />
        <div className="piano-roll-timeline-overlay" />
        <div className="piano-roll-notes-overlay" />
        <PianoRollWindow
          barCount={this.props.barCount} barMin={this.props.barMin} keyMin={this.props.keyMin}
          keyCount={this.props.keyCount} barMax={this.props.barMax} keyMax={this.props.keyMax}
          dispatch={this.props.dispatch}
         />
        <PianoRollNotes />
        <PianoRollKeyboard
          keyMin={this.props.keyMin}
          keyMax={this.props.keyMax}
          dispatch={this.props.dispatch}
          />
        <div className="piano-roll-keyboard-overlay" />
        <div className="piano-roll-scroll-zone"
          onMouseEnter={(e) => this.handleScrollZone(e, true)}
          onMouseLeave={(e) => this.handleScrollZone(e, false)}
          >
          <Scrollbar draggableEndpoints
            min={this.props.barMin} setScroll={(min,max) => this.props.dispatch(pianoRollScrollX(min,max))}
            max={this.props.barMax} forceHover={this.data.scrollZoneHover}
            />
        </div>
      </div>
    );
  }
}

class Note {}
PianoRoll.propTypes = {
  notes:    React.PropTypes.arrayOf(React.PropTypes.instanceOf(Note)),
  cursor:   React.PropTypes.number,
  playHead: React.PropTypes.number,
  barMin:   React.PropTypes.number,
  barMax:   React.PropTypes.number,
  keyMin:   React.PropTypes.number,
  keyMax:   React.PropTypes.number
};
PianoRoll.defaultProps = {
  notes:    [],
  cursor:   0.000,
  playHead: 0.000,
  barCount: 64,
  keyCount: 88,
};


function mapStateToProps(state) {
  return {
    barMin: state.pianoRoll.barMin,
    barMax: state.pianoRoll.barMax,
    keyMin: state.pianoRoll.keyMin,
    keyMax: state.pianoRoll.keyMax
  };
}

export default connect(mapStateToProps)(PianoRoll);
