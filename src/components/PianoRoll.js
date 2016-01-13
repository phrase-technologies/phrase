import React, { Component } from 'react';
import { connect } from 'react-redux';

import { pianorollSelector } from '../selectors/selectorPianoRoll.js';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY } from '../actions/actions.js';

import EffectsModule          from './EffectsModule.js';
import PianoRollTimeline      from './PianoRollTimeline.js';
import PianoRollWindow        from './PianoRollWindow.js';
import PianoRollWindowSlider  from './PianoRollWindowSlider.js';
import PianoRollKeyboard      from './PianoRollKeyboard.js';
import Scrollbar              from './Scrollbar.js';

export default class PianoRoll extends Component {

  constructor() {
    super();
    this.data = {};
  }

  render() {
    let dispatchProp = {
      dispatch: this.props.dispatch
    }
    let keyboardProps = {
      keyMin: this.props.keyMin,
      keyMax: this.props.keyMax,
      keyCount: this.props.keyCount
    }
    let timelineProps = {
      barMin: this.props.barMin,
      barMax: this.props.barMax,
      barCount: this.props.barCount
    }
    return (
      <div className="piano-roll">
        <PianoRollKeyboard {...dispatchProp} {...keyboardProps} />
        <PianoRollTimeline {...dispatchProp} {...timelineProps} ref={(ref) => this.timeline = ref} />
        <PianoRollWindow {...dispatchProp} {...keyboardProps} {...timelineProps} >
          <PianoRollWindowSlider {...this.props} />
          <div className="piano-roll-window-scroll-zone"
            onMouseEnter={(e) => this.handleScrollZone(e, true)}
            onMouseLeave={(e) => this.handleScrollZone(e, false)}
          >
            <Scrollbar draggableEndpoints
              min={this.props.barMin} setScroll={(min,max) => this.props.dispatch(pianoRollScrollX(min,max))}
              max={this.props.barMax} forceHover={this.data.scrollZoneHover}
            />
          </div>        
        </PianoRollWindow>
      </div>
    );
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

}

PianoRoll.propTypes = {
  clips:    React.PropTypes.array,
  notes:    React.PropTypes.array,
  cursor:   React.PropTypes.number,
  playHead: React.PropTypes.number,
  barMin:   React.PropTypes.number,
  barMax:   React.PropTypes.number,
  keyMin:   React.PropTypes.number,
  keyMax:   React.PropTypes.number,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number
};
PianoRoll.defaultProps = {
  cursor:   0.000,
  playHead: 0.000,
  barCount: 64,
  keyCount: 88,
};

export default connect(pianorollSelector)(PianoRoll);
