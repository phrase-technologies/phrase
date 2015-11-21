import React from 'react';
import PianoRollBase from './PianoRollBase';

export default class PianoRollTimeline extends PianoRollBase {

  constructor() {
    super();
    this.className = "piano-roll-timeline";
  }

  componentDidMount() {
    super.componentDidMount();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  renderFrame() {
    this.backgroundFill("#444444");
    this.renderKeyLines();

    // Top bar
    this.data.canvasContext.fillStyle = "#282828";
    var topMargin = this.closestHalfPixel( this.data.marginTop*this.data.pixelScale );
    this.data.canvasContext.fillRect( 0, 0, this.data.width, topMargin );

    this.renderBarLines();

    // Borders
    this.data.canvasContext.lineWidth = 2.0;
    var topEdge =    this.closestHalfPixel( this.data.pixelScale*this.data.marginTop );
    var bottomEdge = this.closestHalfPixel( this.data.pixelScale*(this.data.marginTop + 1) );
    this.drawLine( 0,    topEdge, this.data.width,    topEdge, false, "#000000" );
    this.drawLine( 0, bottomEdge, this.data.width, bottomEdge, false, "rgba(0,0,0,0.125)" );
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
    for( var bar = minBar; bar <= maxBar; bar += 0.25 )
    {
      // Start each line as a separate path (different colors)
      this.data.canvasContext.beginPath();
      this.data.canvasContext.strokeStyle = ( bar % 1 ) ? "#383838" : "#2C2C2C";

      var xPosition = this.closestHalfPixel( this.barToXCoord( bar ) );
      this.drawLine( xPosition, 0, xPosition, this.data.height );

      // Draw each line (different colors)
      this.data.canvasContext.stroke();

      // Bar Numbers + markers
      if( bar % 1 === 0 )
      {
        this.data.canvasContext.beginPath();
        let topEdge = 0;
        let topEdgeText = topEdge + 14*this.data.pixelScale;
        let bottomEdge  = this.closestHalfPixel( this.data.marginTop*this.data.pixelScale ) - 1;
        let leftEdge  = xPosition +  4*this.data.pixelScale;
        this.data.canvasContext.fillText(bar + 1, leftEdge, topEdgeText);
        this.data.canvasContext.strokeStyle = "#555555";
        this.drawLine( xPosition, 0, xPosition, bottomEdge );
        this.data.canvasContext.stroke();
      }
    }    
  }

  renderKeyLines() {
    // Styles
    this.data.canvasContext.lineWidth   = 1.0;
    this.data.canvasContext.setLineDash([]);
    this.data.canvasContext.strokeStyle = "#383838";
    this.data.canvasContext.fillStyle   = "#3D3D3D";

    // Each edge + black key fills
    var minKey = this.percentToKey( this.props.keyMin );
    var maxKey = this.percentToKey( this.props.keyMax );
    for( var key = minKey; key - 1 <= maxKey; key++ )
    {
      var prevEdge = this.closestHalfPixel( this.keyToYCoord( key - 1 ) ) + 1;   // Extra pixel to account for stroke width
      var nextEdge = this.closestHalfPixel( this.keyToYCoord( key     ) ) + 1;   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      this.drawLine( 0, prevEdge, this.data.width, prevEdge, false );

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
        this.data.canvasContext.strokeStyle = "#383838";
      }
    }
    // One final stroke to end the last octave!
    this.data.canvasContext.stroke();
  }  
}

PianoRollTimeline.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired,
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired
};