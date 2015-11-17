import React, { Component } from 'react';
import { connect } from 'react-redux';
import shiftInterval from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY,
       } from '../actions/actions.js';
import PianoRollTimeline    from './PianoRollTimeline.js';
import PianoRollNotes       from './PianoRollNotes.js';
import PianoRollKeyboard    from './PianoRollKeyboard.js';
import Scrollbar            from './Scrollbar.js';

export default class PianoRoll extends Component {

  constructor() {
    super();
    this.data = {};
  }

  componentDidMount() {
    this.data.container = React.findDOMNode(this);

    // Scroll Handler
    this.data.container.addEventListener("wheel", this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    this.data.container.removeEventListener("wheel", this.handleScroll);
  }

  handleScroll(e) {
    // Horizontal Scroll
    var barWindow = this.props.barMax - this.props.barMin;
    var barStepSize = e.deltaX / this.data.container.clientWidth * barWindow;    
    var [newBarMin, newBarMax] = shiftInterval([this.props.barMin, this.props.barMax], barStepSize);
    this.props.dispatch(pianoRollScrollX(newBarMin, newBarMax));

    // Vertical Scroll
    var keyWindow = this.props.keyMax - this.props.keyMin;
    var keyStepSize = e.deltaY / this.data.container.clientHeight * keyWindow;
    var [newKeyMin, newKeyMax] = shiftInterval([this.props.keyMin, this.props.keyMax], keyStepSize);
    this.props.dispatch(pianoRollScrollY(newKeyMin, newKeyMax));

    e.preventDefault();
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

  render() {
    return (
      <div className="piano-roll">
        <PianoRollTimeline
          barCount={this.props.barCount} barMin={this.props.barMin} keyMin={this.props.keyMin}
          keyCount={this.props.keyCount} barMax={this.props.barMax} keyMax={this.props.keyMax}
          />
        <PianoRollNotes />
        <PianoRollKeyboard />
        <div className="piano-roll-scroll-zone"
          onMouseEnter={(e) => this.handleScrollZone(e, true)}
          onMouseLeave={(e) => this.handleScrollZone(e, false)}
          >
          <Scrollbar
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
  barCount:  4,
  keyCount: 88,
  barMin:    0.000,
  barMax:    1.000,
  keyMin:    0.000,
  keyMax:    1.000
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
