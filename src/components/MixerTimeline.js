import React, { Component } from 'react';
import TimelineBase from './TimelineBase';

import { closestHalfPixel,
         drawLine } from '../helpers/helpers.js';

import CanvasComponent from './CanvasComponent';

export default class MixerTimeline extends TimelineBase {

  constructor() {
    super(...arguments);
    this.data.marginLeft   = 11;
    this.data.marginRight  = 12;
  }

  render() {
    return (
      <div className="mixer-timeline">
        <CanvasComponent renderFrame={this.renderFrame()} />
        {this.props.children}
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = "#282828";
      canvasContext.fillRect( 0, 0, this.data.width, this.data.height );
      this.calculateZoomThreshold();
      this.renderBarLines(canvasContext, this.props.barMin, this.props.barMax);
    }.bind(this);
  }

  renderBarLines(canvasContext, barMin, barMax) {
    // Styles
    canvasContext.lineWidth = 1.0;
    canvasContext.font = 11*this.data.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif";
    canvasContext.fillStyle = "#AAAAAA";
    canvasContext.textAlign = "start";

    // Draw lines for each beat
    var minBar = this.percentToBar( barMin ) - 1;
    var maxBar = this.percentToBar( barMax );
    var majorIncrement = this.data.lineThresholdsNoKeys.majorLine;
    var minorIncrement = this.data.lineThresholdsNoKeys.minorLine || this.data.lineThresholdsNoKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Start each line as a separate path (different colors)
      let xPosition = closestHalfPixel( this.barToXCoord( bar ) );
      let yPosition = 0;

      // Bar Numbers + Major lines
      if( bar % this.data.lineThresholdsNoKeys.majorLine === 0 )
      {
        // Bar Number
        let topEdge  = 14*this.data.pixelScale;
        let leftEdge =  4*this.data.pixelScale + xPosition;
        let barNumber = Math.floor( bar + 1 );
        let barBeat = ((bar + 1) % 1) * 4 + 1;
        let outputText = (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber;
        canvasContext.fillText(outputText, leftEdge, topEdge);

        // Bar line style
        canvasContext.strokeStyle = "#555555";
      }
      // Intermediary Bar lines
      else if( bar % this.data.lineThresholdsNoKeys.middleLine === 0 )
      {
        canvasContext.strokeStyle = "#383838";
        yPosition = 18 * this.data.pixelScale;
      }
      // Minor lines
      else if( this.data.lineThresholdsNoKeys.minorLine )
      {
        canvasContext.strokeStyle = "#333333";
        yPosition = 20 * this.data.pixelScale;
      }

      // Draw each line
      canvasContext.beginPath();
      drawLine( canvasContext, xPosition, yPosition, xPosition, this.data.height );
      canvasContext.stroke();
    }    
  }
}

MixerTimeline.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  

