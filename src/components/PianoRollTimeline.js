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
    this.data.canvasContext.fillStyle = "#303030";
    var topEdge = this.data.height - (50 - 1)*this.data.pixelScale;
    this.data.canvasContext.fillRect( 0, topEdge, this.data.width, this.data.height );
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
        let bottomEdge = this.closestHalfPixel( this.data.height - 50*this.data.pixelScale );
        let bottomEdgeText = bottomEdge + 14*this.data.pixelScale;
        let bottomEdgeLine = bottomEdge + 2*this.data.pixelScale;
        let leftEdge = xPosition + 4*this.data.pixelScale;
        this.data.canvasContext.fillText(bar + 1, leftEdge, bottomEdgeText);
        this.data.canvasContext.strokeStyle = "#555555";
        this.drawLine( xPosition, bottomEdgeLine, xPosition, this.data.height );
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
    for( var key = minKey; key < maxKey; key++ )
    {
      var prevEdge = this.closestHalfPixel( this.keyToYCoord( key     ) ) + 1;   // Extra pixel to account for stroke width
      var nextEdge = this.closestHalfPixel( this.keyToYCoord( key + 1 ) ) + 1;   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      if( prevEdge > 0.5 ) // Skip first edge (we have a border to serve that purpose)
        this.drawLine( 0, prevEdge, this.data.width, prevEdge, false );

      // Fill the row for the black keys
      if( key % 12 in {2:true, 4:true, 6: true, 9: true, 11: true} )
        this.data.canvasContext.fillRect( 0, nextEdge, this.data.width, prevEdge - nextEdge );

      // Stroke it each octave to get different colours
      if( key % 12 === 0 )
      {
        this.data.canvasContext.stroke();
        this.data.canvasContext.beginPath();
        this.data.canvasContext.strokeStyle = "#222222";
      }
      else if( key % 12 === 1 )
      {
        this.data.canvasContext.stroke();
        this.data.canvasContext.beginPath();
        this.data.canvasContext.strokeStyle = "#383838";
      }
    }
    // One final stroke to end the last octave!
    this.data.canvasContext.stroke();

    this.data.canvasContext.beginPath();
    this.data.canvasContext.strokeStyle = "#000000";
    var bottomEdge = this.closestHalfPixel( this.data.height - (50 - 1)*this.data.pixelScale );
    this.drawLine( 0, bottomEdge, this.data.width, bottomEdge, false );
    this.data.canvasContext.stroke();
  }  
}

PianoRollTimeline.propTypes = {
  barCount:     React.PropTypes.number,
  keyCount:     React.PropTypes.number,
  barMin:       React.PropTypes.number,
  barMax:       React.PropTypes.number,
  keyMin:       React.PropTypes.number,
  keyMax:       React.PropTypes.number
};
PianoRollTimeline.defaultProps = {
  barCount:  4,
  keyCount: 88,
  barMin:    0.000,
  barMax:    1.000,
  keyMin:    0.000,
  keyMax:    1.000
};
