import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY } from '../actions/actions.js';
import EffectsModule        from './EffectsModule.js';
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
        >
          <div className="piano-roll-scroll-zone"
            onMouseEnter={(e) => this.handleScrollZone(e, true)}
            onMouseLeave={(e) => this.handleScrollZone(e, false)}
            >
            <Scrollbar draggableEndpoints
              min={this.props.barMin} setScroll={(min,max) => this.props.dispatch(pianoRollScrollX(min,max))}
              max={this.props.barMax} forceHover={this.data.scrollZoneHover}
              />
          </div>        
          <PianoRollNotes
            notes={this.props.notes} dispatch={this.props.dispatch}
            barCount={this.props.barCount} barMin={this.props.barMin} keyMin={this.props.keyMin}
            keyCount={this.props.keyCount} barMax={this.props.barMax} keyMax={this.props.keyMax}
          />
        </PianoRollWindow>
        <PianoRollKeyboard
          keyMin={this.props.keyMin}
          keyMax={this.props.keyMax}
          dispatch={this.props.dispatch}
          />
        <div className="piano-roll-keyboard-overlay" />
      </div>
    );
  }
}

PianoRoll.propTypes = {
  notes:    React.PropTypes.array,
  cursor:   React.PropTypes.number,
  playHead: React.PropTypes.number,
  barMin:   React.PropTypes.number,
  barMax:   React.PropTypes.number,
  keyMin:   React.PropTypes.number,
  keyMax:   React.PropTypes.number
};
PianoRoll.defaultProps = {
  notes:    [
    { id:  0, keyNum: 56, start: 0.000, end: 0.105, velocity: 127 },
    { id:  1, keyNum: 56, start: 0.125, end: 0.230, velocity: 127 },
    { id:  2, keyNum: 30, start: 0.000, end: 0.105, velocity: 127 },
    { id:  3, keyNum: 30, start: 0.125, end: 0.230, velocity: 127 },
    { id:  4, keyNum: 30, start: 0.375, end: 0.510, velocity: 127 },
    { id:  5, keyNum: 56, start: 0.375, end: 0.510, velocity: 127 },
    { id:  6, keyNum: 52, start: 0.625, end: 0.721, velocity: 127 },
    { id:  7, keyNum: 56, start: 0.750, end: 0.846, velocity: 127 },
    { id:  8, keyNum: 30, start: 0.625, end: 0.721, velocity: 127 },
    { id:  9, keyNum: 30, start: 0.750, end: 0.846, velocity: 127 },
    { id: 10, keyNum: 59, start: 1.000, end: 1.088, velocity: 127 },
    { id: 11, keyNum: 51, start: 1.000, end: 1.088, velocity: 127 },
    { id: 12, keyNum: 47, start: 1.000, end: 1.088, velocity: 127 },
    { id: 13, keyNum: 47, start: 1.500, end: 1.588, velocity: 127 },
    { id: 14, keyNum: 52, start: 2.000, end: 2.063, velocity: 127 },
    { id: 15, keyNum: 44, start: 2.000, end: 2.063, velocity: 127 },
    { id: 16, keyNum: 35, start: 2.000, end: 2.063, velocity: 127 },
    { id: 17, keyNum: 47, start: 2.375, end: 2.438, velocity: 127 },
    { id: 18, keyNum: 32, start: 2.375, end: 2.438, velocity: 127 },
    { id: 19, keyNum: 35, start: 1.000, end: 1.063, velocity: 127 },
    { id: 20, keyNum: 35, start: 1.500, end: 1.561, velocity: 127 },
    { id: 21, keyNum: 44, start: 2.750, end: 2.813, velocity: 127 },
    { id: 22, keyNum: 28, start: 2.750, end: 2.813, velocity: 127 },
    { id: 23, keyNum: 33, start: 3.125, end: 3.188, velocity: 127 },
    { id: 24, keyNum: 40, start: 3.125, end: 3.188, velocity: 127 },
    { id: 25, keyNum: 49, start: 3.125, end: 3.188, velocity: 127 },
    { id: 26, keyNum: 40, start: 2.375, end: 2.438, velocity: 127 },
    { id: 27, keyNum: 35, start: 2.750, end: 2.813, velocity: 127 },
    { id: 28, keyNum: 51, start: 3.375, end: 3.438, velocity: 127 },
    { id: 29, keyNum: 50, start: 3.625, end: 3.688, velocity: 127 },
    { id: 30, keyNum: 42, start: 3.375, end: 3.438, velocity: 127 },
    { id: 31, keyNum: 35, start: 3.375, end: 3.438, velocity: 127 },
    { id: 32, keyNum: 41, start: 3.625, end: 3.688, velocity: 127 },
    { id: 33, keyNum: 34, start: 3.625, end: 3.688, velocity: 127 },
    { id: 34, keyNum: 49, start: 3.777, end: 3.869, velocity: 127 },
    { id: 35, keyNum: 40, start: 3.777, end: 3.869, velocity: 127 },
    { id: 36, keyNum: 33, start: 3.777, end: 3.869, velocity: 127 },
    { id: 37, keyNum: 40, start: 4.000, end: 4.063, velocity: 127 },
    { id: 38, keyNum: 47, start: 4.000, end: 4.063, velocity: 127 },
    { id: 39, keyNum: 32, start: 4.000, end: 4.063, velocity: 127 },
    { id: 40, keyNum: 56, start: 4.151, end: 4.213, velocity: 127 },
    { id: 41, keyNum: 47, start: 4.151, end: 4.213, velocity: 127 },
    { id: 42, keyNum: 40, start: 4.151, end: 4.213, velocity: 127 },
    { id: 43, keyNum: 44, start: 4.331, end: 4.394, velocity: 127 },
    { id: 44, keyNum: 51, start: 4.331, end: 4.394, velocity: 127 },
    { id: 45, keyNum: 59, start: 4.331, end: 4.394, velocity: 127 },
    { id: 46, keyNum: 46, start: 0.375, end: 0.479, velocity: 127 },
    { id: 47, keyNum: 46, start: 0.125, end: 0.229, velocity: 127 },
    { id: 48, keyNum: 46, start: 0.000, end: 0.104, velocity: 127 },
    { id: 49, keyNum: 46, start: 0.625, end: 0.715, velocity: 127 },
    { id: 50, keyNum: 46, start: 0.750, end: 0.840, velocity: 127 },
    { id: 51, keyNum: 45, start: 4.500, end: 4.563, velocity: 127 },
    { id: 52, keyNum: 52, start: 4.500, end: 4.563, velocity: 127 },
    { id: 53, keyNum: 61, start: 4.500, end: 4.563, velocity: 127 },
    { id: 54, keyNum: 42, start: 4.688, end: 4.750, velocity: 127 },
    { id: 55, keyNum: 52, start: 5.250, end: 5.313, velocity: 127 },
    { id: 56, keyNum: 54, start: 5.375, end: 5.438, velocity: 127 },
    { id: 57, keyNum: 51, start: 5.500, end: 5.563, velocity: 127 },
    { id: 58, keyNum: 44, start: 5.250, end: 5.313, velocity: 127 },
    { id: 59, keyNum: 45, start: 5.375, end: 5.438, velocity: 127 },
    { id: 60, keyNum: 42, start: 5.500, end: 5.563, velocity: 127 },
    { id: 61, keyNum: 37, start: 5.250, end: 5.313, velocity: 127 },
    { id: 62, keyNum: 39, start: 5.375, end: 5.438, velocity: 127 },
    { id: 63, keyNum: 35, start: 5.500, end: 5.563, velocity: 127 },
    { id: 64, keyNum: 49, start: 4.688, end: 4.750, velocity: 127 },
    { id: 65, keyNum: 57, start: 4.688, end: 4.750, velocity: 127 },
    { id: 66, keyNum: 56, start: 5.000, end: 5.063, velocity: 127 },
    { id: 67, keyNum: 49, start: 5.000, end: 5.063, velocity: 127 },
    { id: 68, keyNum: 40, start: 5.000, end: 5.063, velocity: 127 },
    { id: 69, keyNum: 59, start: 4.813, end: 4.875, velocity: 127 },
    { id: 70, keyNum: 51, start: 4.813, end: 4.875, velocity: 127 },
    { id: 71, keyNum: 44, start: 4.813, end: 4.875, velocity: 127 }
  ],
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
