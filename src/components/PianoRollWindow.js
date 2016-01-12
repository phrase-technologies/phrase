import React from 'react';
import TimelineBase from './TimelineBase';

import { closestHalfPixel,
         drawLine } from '../helpers/helpers.js';

import CanvasComponent from './CanvasComponent';

export default class PianoRollWindow extends TimelineBase {

  constructor() {
    super();
    this.data.marginTop    =  0;
    this.data.marginBottom = 30;
    this.data.marginLeft   = 10;
    this.data.marginRight  = 10;
  }

  render() {
    return (
      <div className="piano-roll-window-frame">
        <CanvasComponent renderFrame={this.renderFrame()} />
        {this.props.children}
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = "#444444";
      canvasContext.fillRect( 0, 0, this.data.width, this.data.height );
      this.calculateZoomThreshold();
      this.renderKeyLines(canvasContext, this.props.keyMin, this.props.keyMax);
      this.renderBarLines(canvasContext, this.props.barMin, this.props.barMax);
    }.bind(this);
  }

  renderBarLines(canvasContext, barMin, barMax) {
    // TODO: Missing dependencies, temporarily stubbed
    var key = { alt: false };

    // Styles
    canvasContext.lineWidth = 1.0;
    canvasContext.setLineDash( key.alt ? [2,4] : [] );
    canvasContext.font = 11*this.data.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif";
    canvasContext.fillStyle = "#AAAAAA";
    canvasContext.textAlign = "start";

    // Draw lines for each beat
    var minBar = this.percentToBar( barMin ) - 1;
    var maxBar = this.percentToBar( barMax );
    var minorIncrement = this.data.lineThresholdsWithKeys.minorLine || this.data.lineThresholdsWithKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.data.lineThresholdsWithKeys.majorLine === 0 )
        canvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.data.lineThresholdsWithKeys.middleLine === 0 )
        canvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.data.lineThresholdsWithKeys.minorLine )
        canvasContext.strokeStyle = "#383838";

      // Draw each line (different colors)
      canvasContext.beginPath();
      drawLine( canvasContext, xPosition, 0, xPosition, this.data.height );
      canvasContext.stroke();
    }
  }

  renderKeyLines(canvasContext, keyMin, keyMax) {
    // Styles
    canvasContext.lineWidth   = 1.0;
    canvasContext.setLineDash([]);
    canvasContext.strokeStyle = "#393939";
    canvasContext.fillStyle   = "#3D3D3D";

    // Each edge + black key fills
    var minKey = this.percentToKey( keyMin );
    var maxKey = this.percentToKey( keyMax );
    for( var key = minKey; key - 1 <= maxKey; key++ )
    {
      var prevEdge = closestHalfPixel( this.keyToYCoord( key - 1 ) ) + 1;   // Extra pixel to account for stroke width
      var nextEdge = closestHalfPixel( this.keyToYCoord( key     ) ) + 1;   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      drawLine( canvasContext, 0, prevEdge, this.data.width, prevEdge, false );

      // Fill the row for the black keys
      if( key % 12 in {3:true, 5:true, 7: true, 10: true, 0: true} )
        canvasContext.fillRect( 0, nextEdge, this.data.width, prevEdge - nextEdge );

      // Stroke it each octave to get different colours
      if( key % 12 === 1 )
      {
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.strokeStyle = "#222222";
      }
      else if( key % 12 === 2 )
      {
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.strokeStyle = "#393939";
      }
    }
    // One final stroke to end the last octave!
     canvasContext.stroke();
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
