import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimelineBase from './TimelineBase';

export default class MixerTimeline extends TimelineBase {

  constructor() {
    super(...arguments);
    this.className = "mixer-timeline";
    this.data.marginLeft   = 10;
    this.data.marginRight  = 10;
  }

  renderFrame() {
    this.backgroundFill("#282828");
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
    for( var bar = minBar; bar <= maxBar; bar += 0.25 )
    {
      // Start each line as a separate path (different colors)
      var xPosition = this.closestHalfPixel( this.barToXCoord( bar ) );

      // Bar Numbers + Bar lines
      if( bar % 1 === 0 )
      {
        let topEdge  = 14*this.data.pixelScale;
        let leftEdge =  4*this.data.pixelScale + xPosition;
        this.data.canvasContext.fillText(bar + 1, leftEdge, topEdge);
        this.data.canvasContext.strokeStyle = "#555555";
      }
      // Intermediary lines
      else
      {
        this.data.canvasContext.strokeStyle = "#383838";
      }

      // Draw each line
      this.data.canvasContext.beginPath();
      this.drawLine( xPosition, 0, xPosition, this.data.height );
      this.data.canvasContext.stroke();
    }    
  }
}

MixerTimeline.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
MixerTimeline.defaultProps = {
  cursor:   0.000,
  playHead: 0.000,
  barCount:  4
};
