import React, { Component } from 'react';
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash';
import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js';
import { mixerScrollX,
         mixerScrollY,
         mixerMoveCursor } from '../actions/actionsMixer.js';

import CanvasComponent from './CanvasComponent.js';
import MixerTrackClips from './MixerTrackClips.js';

export class MixerTrackWindow extends Component {

  componentDidUpdate() {
    this.props.grid.marginLeft   = 10;
    this.props.grid.marginRight  = 7;
  }

  render() {
    let xWindowPercent = (this.props.xMax - this.props.xMin);
    let left = -100 * this.props.xMin;
    let xScale = 100 / xWindowPercent + '%';
    var sliderStyle = {
      transform: 'translate3d('+left+'%,0px,1px)',
      transformOrigin: '0 100 0',
      width: xScale
    };

    return (
      <div className="mixer-track-window">
        <div className="mixer-track-window-sill">
          <div className="mixer-track-window-slider" style={sliderStyle}>
            <MixerTrackClips
              track={this.props.track}
              barCount={this.props.barCount}
              dispatch={this.props.dispatch}
            />
          </div>
        </div>
      </div>
    );
  }

}

MixerTrackWindow.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  track:        React.PropTypes.object.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  xMin:       React.PropTypes.number.isRequired,
  xMax:       React.PropTypes.number.isRequired
};  

export default provideGridSystem(
  provideGridScroll(
    MixerTrackWindow,
    {
      scrollXActionCreator: mixerScrollX,
      scrollYActionCreator: mixerScrollY,
      cursorActionCreator: mixerMoveCursor
    }
  )
)
