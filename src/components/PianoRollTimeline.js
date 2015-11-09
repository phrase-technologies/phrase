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
    this.renderKeyLines();
    this.renderBarLines();
  }

  renderBarLines() {
    // TODO: Missing dependencies, temporarily stubbed
    var key = { alt: false };

    // Styles
    this.data.canvasContext.lineWidth = 1.0;
    this.data.canvasContext.setLineDash( key.alt ? [2,4] : [] );
    // Draw lines for each beat
    var minBar = this.percentToBar( this.props.barMin ) - 1;
    var maxBar = this.percentToBar( this.props.barMax );
    for( var bar = minBar; bar <= maxBar; bar += 0.25 )
    {
      // Start each line as a separate path (different colors)
      this.data.canvasContext.beginPath();
      this.data.canvasContext.strokeStyle = ( bar % 1 ) ? "#444" : "#777";

      var xPosition = this.closestHalfPixel( this.barToXCoord( bar ) );
      this.drawLine( xPosition, 0, xPosition, this.data.height );

      // Draw each line (different colors)
      this.data.canvasContext.stroke();
    }    
  }

  renderKeyLines() {
    // Styles
    this.data.canvasContext.lineWidth   = 1.0;
    this.data.canvasContext.setLineDash([]);
    this.data.canvasContext.strokeStyle = "#444";
    this.data.canvasContext.fillStyle   = "#222";

    // Each edge + black key fills
    var minKey = this.percentToKey( this.props.keyMin );
    var maxKey = this.percentToKey( this.props.keyMax );
    for( var key = minKey; key <= maxKey; key++ )
    {
      var prevEdge = this.closestHalfPixel( this.keyToYCoord( key - 1 ) ) + 1;   // Extra pixel to account for stroke width
      var nextEdge = this.closestHalfPixel( this.keyToYCoord( key     ) ) + 1;   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      if( prevEdge > 0.5 ) // Skip first edge (we have a border to serve that purpose)
        this.drawLine( 0, prevEdge, this.data.width, prevEdge, false );

      // Fill the row for the black keys
      if( key % 12 in {0:true, 2:true, 5: true, 7: true, 10: true} )
        this.data.canvasContext.fillRect( 0, nextEdge, this.data.width, prevEdge - nextEdge );
    }

    // Stroke it all at the end!
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
