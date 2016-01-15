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
         drawLine } from '../helpers/helpers.js';
import { mixerScrollX,
         mixerScrollY,
         mixerCursor } from '../actions/actions.js';

import CanvasComponent from './CanvasComponent';

export class MixerScrollWindow extends Component {

  componentDidMount() {
    this.props.grid.marginLeft   = 10;
    this.props.grid.marginRight  = 7;
  }

  render() {
    return (
      <div className="mixer-scroll-window">
        <CanvasComponent renderFrame={this.renderFrame()} />
        {this.props.children}
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = "#444444";
      canvasContext.fillRect( 0, 0, this.props.grid.width, this.props.grid.height );
      this.props.grid.calculateZoomThreshold();
      this.renderTimeline(canvasContext, this.props.xMin, this.props.xMax)
    }.bind(this);
  }

  renderTimeline(canvasContext, xMin, xMax) {
    // Draw lines for each beat
    canvasContext.lineWidth = 1.0;
    var minBar = this.props.grid.percentToBar( xMin ) - 1;
    var maxBar = this.props.grid.percentToBar( xMax );
    var minorIncrement = this.props.grid.lineThresholdsNoKeys.minorLine || this.props.grid.lineThresholdsNoKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.props.grid.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.props.grid.lineThresholdsNoKeys.majorLine === 0 )
        canvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.props.grid.lineThresholdsNoKeys.middleLine === 0 )
        canvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.props.grid.lineThresholdsNoKeys.minorLine )
        canvasContext.strokeStyle = "#3C3C3C";

      canvasContext.beginPath();
      drawLine( canvasContext, xPosition, 0, xPosition, this.props.grid.height );
      canvasContext.stroke();
    }    
  }

}

MixerScrollWindow.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  xMin:       React.PropTypes.number.isRequired,
  xMax:       React.PropTypes.number.isRequired
}

export default provideGridSystem(
  provideGridScroll(
    MixerScrollWindow,
    {
      scrollXActionCreator: mixerScrollX,
      scrollYActionCreator: mixerScrollY,
      cursorActionCreator: mixerCursor
    }
  )
)
