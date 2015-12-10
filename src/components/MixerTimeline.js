import React, { Component } from 'react';

import { closestHalfPixel,
         canvasReset,
         drawLine } from '../helpers/helpers.js';

import TimelineBase from './TimelineBase';

export default class MixerTimeline extends TimelineBase {

  constructor() {
    super(...arguments);
    this.className = "mixer-timeline";
    this.data.marginLeft   = 11;
    this.data.marginRight  = 12;
  }

  renderFrame() {
    canvasReset(this.data.canvasContext, this.data.canvas, "#282828");
    this.calculateZoomThreshold();
    this.renderBarLines();
  }

  renderBarLines() {
    // Styles
    this.data.canvasContext.lineWidth = 1.0;
    this.data.canvasContext.font = 11*this.data.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif";
    this.data.canvasContext.fillStyle = "#AAAAAA";
    this.data.canvasContext.textAlign = "start";

    // Draw lines for each beat
    var minBar = this.percentToBar( this.props.barMin ) - 1;
    var maxBar = this.percentToBar( this.props.barMax );
    var majorIncrement = this.data.lineThicknessThresholds.majorLine;
    var minorIncrement = this.data.lineThicknessThresholds.minorLine || this.data.lineThicknessThresholds.middleLine;
    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Start each line as a separate path (different colors)
      let xPosition = closestHalfPixel( this.barToXCoord( bar ) );
      let yPosition = 0;

      // Bar Numbers + Major lines
      if( bar % this.data.lineThicknessThresholds.majorLine === 0 )
      {
        // Bar Number
        let topEdge  = 14*this.data.pixelScale;
        let leftEdge =  4*this.data.pixelScale + xPosition;
        let barNumber = Math.floor( bar + 1 );
        let barBeat = ((bar + 1) % 1) * 4 + 1;
        let outputText = (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber;
        this.data.canvasContext.fillText(outputText, leftEdge, topEdge);

        // Bar line style
        this.data.canvasContext.strokeStyle = "#555555";
      }
      // Intermediary Bar lines
      else if( bar % this.data.lineThicknessThresholds.middleLine === 0 )
      {
        this.data.canvasContext.strokeStyle = "#383838";
        yPosition = 18 * this.data.pixelScale;
      }
      // Minor lines
      else if( this.data.lineThicknessThresholds.minorLine )
      {
        this.data.canvasContext.strokeStyle = "#333333";
        yPosition = 20 * this.data.pixelScale;
      }

      // Draw each line
      this.data.canvasContext.beginPath();
      drawLine( this.data.canvasContext, xPosition, yPosition, xPosition, this.data.height );
      this.data.canvasContext.stroke();
    }    
  }
}

MixerTimeline.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  

