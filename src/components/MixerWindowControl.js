// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react';
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash';
import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js';
import { mixerScrollX,
         mixerScrollY,
         mixerResizeWidth,
         mixerResizeHeight,
         mixerMoveCursor } from '../actions/actionsMixer.js';

import CanvasComponent from './CanvasComponent';

export class MixerWindowControl extends Component {

  render() {
    return (
      <div className="mixer-window-control">
        {this.props.children}
      </div>
    );
  }

  constructor(){
    super(...arguments)
    this.handleResize = this.handleResize.bind(this)
  }

  componentDidMount() {
    this.props.grid.marginLeft   = 10;
    this.props.grid.marginRight  = 11;
    this.props.grid.didMount()
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.props.dispatch(mixerResizeWidth( this.props.grid.width  / this.props.grid.pixelScale - this.props.grid.marginLeft));
    this.props.dispatch(mixerResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop ));
  }
}

MixerWindowControl.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  tracks:       React.PropTypes.array.isRequired,
  clips:        React.PropTypes.array.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}

export default provideGridSystem(
  provideGridScroll(
    MixerWindowControl,
    {
      scrollXActionCreator: mixerScrollX,
      scrollYActionCreator: mixerScrollY,
      cursorActionCreator: mixerMoveCursor,
      enableZoomY: false
    }
  )
)
