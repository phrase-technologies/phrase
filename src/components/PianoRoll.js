import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pianoRollScrollX,
         pianoRollScrollY,
       } from '../actions/actions.js';
import PianoRollTimeline    from './PianoRollTimeline';
import PianoRollNotes       from './PianoRollNotes';
import PianoRollKeyboard    from './PianoRollKeyboard';
import PianoRollScroll      from './PianoRollScroll';

export default class PianoRoll extends Component {

  componentDidMount() {
    this.data = this.data || {};
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
    var newBarMin = this.props.barMin + barStepSize; 
    var newBarMax = this.props.barMax + barStepSize;
    if( newBarMin < 0.0 )
    {
      newBarMax -= newBarMin;
      newBarMin = 0.0;
    }
    if( newBarMax > 1.0 )
    {
      newBarMin -= (newBarMax - 1.0);
      newBarMax = 1.0;
    }
    this.props.dispatch(pianoRollScrollX(newBarMin, newBarMax));

    // Vertical Scroll
    var keyWindow = this.props.keyMax - this.props.keyMin;
    var keyStepSize = e.deltaY / this.data.container.clientHeight * keyWindow;
    var newKeyMin = this.props.keyMin + keyStepSize; 
    var newKeyMax = this.props.keyMax + keyStepSize;
    if( newKeyMin < 0.0 )
    {
      newKeyMax -= newKeyMin;
      newKeyMin = 0.0;
    }
    if( newKeyMax > 1.0 )
    {
      newKeyMin -= (newKeyMax - 1.0);
      newKeyMax = 1.0;
    }
    this.props.dispatch(pianoRollScrollY(newKeyMin, newKeyMax));

    e.preventDefault();
  }

  render() {
    return (
      <div className="piano-roll">
        <PianoRollTimeline
          barCount={this.props.barCount}
          keyCount={this.props.keyCount}
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          keyMin={this.props.keyMin}
          keyMax={this.props.keyMax}
          />
        <PianoRollNotes />
        <PianoRollKeyboard />
        <div className="piano-roll-scroll-zone">
          <PianoRollScroll
            min={this.props.barMin}
            max={this.props.barMax}
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
  playHead: 0.000
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
