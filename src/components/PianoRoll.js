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
    this.data.container.removeEventListener("wheel", this.handleScroll.bind(this));
  }

  handleScroll(e) {
    // Horizontal Scroll
    var horizontalWindow = this.props.barMax - this.props.barMin;
    var horizontalStepSize = e.deltaX / this.data.container.clientWidth * horizontalWindow;    
    this.props.dispatch(pianoRollScrollX(horizontalStepSize));

    // Vertical Scroll
    var verticalWindow = this.props.keyMax - this.props.keyMin;
    var verticalStepSize = e.deltaY / this.data.container.clientHeight * verticalWindow;
    this.props.dispatch(pianoRollScrollY(verticalStepSize));

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
        <PianoRollScroll
          min={this.props.barMin}
          max={this.props.barMax}
          />
      </div>
    );
  }
}

class Note {}
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


function mapStateToProps(state) {
  console.log( state.pianoRoll );
  return {
    barMin: state.pianoRoll.barMin,
    barMax: state.pianoRoll.barMax,
    keyMin: state.pianoRoll.keyMin,
    keyMax: state.pianoRoll.keyMax
  };
}

export default connect(mapStateToProps)(PianoRoll);
