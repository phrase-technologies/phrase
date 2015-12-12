import React from 'react';

import { closestHalfPixel,
         canvasReset,
         drawLine } from '../helpers/helpers.js';

import TimelineBase from './TimelineBase';

export default class PianoRollWindow extends TimelineBase {

  constructor() {
    super();
    this.data.marginTop    =  0;
    this.data.marginBottom = 30;
    this.data.marginLeft   = 10;
    this.data.marginRight  = 10;
    this.className = "piano-roll-window";
  }

  renderFrame() {
    canvasReset(this.data.canvasContext, this.data.canvas, "#444444");
    this.calculateZoomThreshold();
    this.renderKeyLines();
    this.renderBarLines();
  }

  renderBarLines() {
    // TODO: Missing dependencies, temporarily stubbed
    var key = { alt: false };

    // Styles
    this.data.canvasContext.lineWidth = 1.0;
    this.data.canvasContext.setLineDash( key.alt ? [2,4] : [] );
    this.data.canvasContext.font = 11*this.data.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif";
    this.data.canvasContext.fillStyle = "#AAAAAA";
    this.data.canvasContext.textAlign = "start";

    // Draw lines for each beat
    var minBar = this.percentToBar( this.props.barMin ) - 1;
    var maxBar = this.percentToBar( this.props.barMax );
    var minorIncrement = this.data.lineThresholdsWithKeys.minorLine || this.data.lineThresholdsWithKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.data.lineThresholdsWithKeys.majorLine === 0 )
        this.data.canvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.data.lineThresholdsWithKeys.middleLine === 0 )
        this.data.canvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.data.lineThresholdsWithKeys.minorLine )
        this.data.canvasContext.strokeStyle = "#383838";

      // Draw each line (different colors)
      this.data.canvasContext.beginPath();
      drawLine( this.data.canvasContext, xPosition, 0, xPosition, this.data.height );
      this.data.canvasContext.stroke();
    }
  }

  renderKeyLines() {
    // Styles
    this.data.canvasContext.lineWidth   = 1.0;
    this.data.canvasContext.setLineDash([]);
    this.data.canvasContext.strokeStyle = "#393939";
    this.data.canvasContext.fillStyle   = "#3D3D3D";

    // Each edge + black key fills
    var minKey = this.percentToKey( this.props.keyMin );
    var maxKey = this.percentToKey( this.props.keyMax );
    for( var key = minKey; key - 1 <= maxKey; key++ )
    {
      var prevEdge = closestHalfPixel( this.keyToYCoord( key - 1 ) ) + 1;   // Extra pixel to account for stroke width
      var nextEdge = closestHalfPixel( this.keyToYCoord( key     ) ) + 1;   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      drawLine( this.data.canvasContext, 0, prevEdge, this.data.width, prevEdge, false );

      // Fill the row for the black keys
      if( key % 12 in {3:true, 5:true, 7: true, 10: true, 0: true} )
        this.data.canvasContext.fillRect( 0, nextEdge, this.data.width, prevEdge - nextEdge );

      // Stroke it each octave to get different colours
      if( key % 12 === 1 )
      {
        this.data.canvasContext.stroke();
        this.data.canvasContext.beginPath();
        this.data.canvasContext.strokeStyle = "#222222";
      }
      else if( key % 12 === 2 )
      {
        this.data.canvasContext.stroke();
        this.data.canvasContext.beginPath();
        this.data.canvasContext.strokeStyle = "#393939";
      }
    }
    // One final stroke to end the last octave!
    this.data.canvasContext.stroke();
  }  
}

PianoRollWindow.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired,
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired
};
