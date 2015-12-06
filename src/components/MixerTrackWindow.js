import React, { Component } from 'react';
import TimelineBase from './TimelineBase';

export default class MixerTrackWindow extends TimelineBase {

  constructor() {
    super(...arguments);
    this.className = "mixer-track-window";
    this.data.marginLeft   = 10;
    this.data.marginRight  = 7;
  }

  renderFrame() {
    this.backgroundFill("#444444");
    this.calculateZoomThreshold();
    this.renderBarLines();
  }

  renderBarLines() {
    // Styles
    this.data.canvasContext.lineWidth = 1.0;

    // Draw lines for each beat
    var minBar = this.percentToBar( this.props.barMin ) - 1;
    var maxBar = this.percentToBar( this.props.barMax );
    var minorIncrement = this.data.lineThicknessThresholds.minorLine || this.data.lineThicknessThresholds.middleLine;
    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = this.closestHalfPixel( this.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.data.lineThicknessThresholds.majorLine === 0 )
        this.data.canvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.data.lineThicknessThresholds.middleLine === 0 )
        this.data.canvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.data.lineThicknessThresholds.minorLine )
        this.data.canvasContext.strokeStyle = "#3C3C3C";

      this.data.canvasContext.beginPath();
      this.drawLine( xPosition, 0, xPosition, this.data.height );
      this.data.canvasContext.stroke();
    }    
  }
}

MixerTrackWindow.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
