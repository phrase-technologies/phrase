import React, { Component } from 'react';
import TimelineBase from './TimelineBase';

import _ from 'lodash';
import { closestHalfPixel,
         drawLine } from '../helpers/helpers.js';

import CanvasComponent from './CanvasComponent';

export default class MixerTrackWindow extends TimelineBase {

  constructor() {
    super(...arguments);
    this.data.marginLeft   = 10;
    this.data.marginRight  = 7;
  }

  render() {
    return (
      <div className="mixer-track-window">
        {/* // Causes Jank. Shouldn't be needed when we can to CSS translate3d of divs
        <CanvasComponent renderFrame={this.renderFrame()} />
        */}
        {this.props.children}
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = "transparent";
    //canvasContext.fillStyle = "#444444";
      canvasContext.fillRect( 0, 0, this.data.width, this.data.height );
      // this.calculateZoomThreshold();
      // this.renderTimeline(canvasContext, this.props.barMin, this.props.barMax)
    }.bind(this);
  }

  renderTimeline(canvasContext, barMin, barMax) {
    // Draw lines for each beat
    canvasContext.lineWidth = 1.0;
    var minBar = this.percentToBar( barMin ) - 1;
    var maxBar = this.percentToBar( barMax );
    var minorIncrement = this.data.lineThresholdsNoKeys.minorLine || this.data.lineThresholdsNoKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.data.lineThresholdsNoKeys.majorLine === 0 )
        canvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.data.lineThresholdsNoKeys.middleLine === 0 )
        canvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.data.lineThresholdsNoKeys.minorLine )
        canvasContext.strokeStyle = "#3C3C3C";

      canvasContext.beginPath();
      drawLine( canvasContext, xPosition, 0, xPosition, this.data.height );
      canvasContext.stroke();
    }    
  }
}

MixerTrackWindow.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
