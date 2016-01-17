import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import { closestHalfPixel,
         drawLine } from '../helpers/helpers.js'
import { pianorollScrollX,
         pianorollScrollY,
         pianorollCursor } from '../actions/actions.js'

import CanvasComponent from './CanvasComponent'

export class PianorollWindow extends Component {

  componentDidMount() {
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom = 30
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
  }

  render() {
    return (
      <div className="pianoroll-window-frame">
        <CanvasComponent renderFrame={this.renderFrame()} />
        {this.props.children}
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.clearRect( 0, 0, this.props.grid.width, this.props.grid.height )
      this.props.grid.calculateZoomThreshold();
      this.renderKeyLines(canvasContext, this.props.yMin, this.props.yMax)
      this.renderBarLines(canvasContext, this.props.xMin, this.props.xMax)
    }.bind(this)
  }

  renderBarLines(canvasContext, xMin, xMax) {
    // TODO: Missing dependencies, temporarily stubbed
    var key = { alt: false }

    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.setLineDash( key.alt ? [2,4] : [] )
    canvasContext.font = 11*this.props.grid.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif"
    canvasContext.fillStyle = "#AAAAAA"
    canvasContext.textAlign = "start"

    // Draw lines for each beat
    var minBar = this.props.grid.percentToBar( xMin ) - 1
    var maxBar = this.props.grid.percentToBar( xMax )
    var minorIncrement = this.props.grid.lineThresholdsWithKeys.minorLine || this.props.grid.lineThresholdsWithKeys.middleLine

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement)

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.props.grid.barToXCoord( bar ) )

      // Major Bar lines
      if( bar % this.props.grid.lineThresholdsWithKeys.majorLine === 0 )
        canvasContext.strokeStyle = "#222222"
      // Intermediary Bar lines
      else if( bar % this.props.grid.lineThresholdsWithKeys.middleLine === 0 )
        canvasContext.strokeStyle = "#333333"
      // Minor Bar lines
      else if( this.props.grid.lineThresholdsWithKeys.minorLine )
        canvasContext.strokeStyle = "#383838"

      // Draw each line (different colors)
      canvasContext.beginPath()
      drawLine( canvasContext, xPosition, 0, xPosition, this.props.grid.height )
      canvasContext.stroke()
    }
  }

  renderKeyLines(canvasContext, yMin, yMax) {
    // Styles
    canvasContext.lineWidth   = 1.0;
    canvasContext.setLineDash([])
    canvasContext.strokeStyle = "#393939"
    canvasContext.fillStyle   = "#3D3D3D"

    // Each edge + black key fills
    var minKey = this.props.grid.percentToKey( yMin )
    var maxKey = this.props.grid.percentToKey( yMax )
    for( var key = minKey; key - 1 <= maxKey; key++ )
    {
      var prevEdge = closestHalfPixel( this.props.grid.keyToYCoord( key - 1 ) ) + 1   // Extra pixel to account for stroke width
      var nextEdge = closestHalfPixel( this.props.grid.keyToYCoord( key     ) ) + 1   // Extra pixel to account for stroke width

      // Stroke the edge between rows
      drawLine( canvasContext, 0, prevEdge, this.props.grid.width, prevEdge, false )

      // Fill the row for the black keys
      if( key % 12 in {3:true, 5:true, 7: true, 10: true, 0: true} )
        canvasContext.fillRect( 0, nextEdge, this.props.grid.width, prevEdge - nextEdge )

      // Stroke it each octave to get different colours
      if( key % 12 === 1 )
      {
        canvasContext.stroke()
        canvasContext.beginPath()
        canvasContext.strokeStyle = "#222222";
      }
      else if( key % 12 === 2 )
      {
        canvasContext.stroke()
        canvasContext.beginPath()
        canvasContext.strokeStyle = "#393939";
      }
    }
    // One final stroke to end the last octave!
     canvasContext.stroke()
  }  
}

PianorollWindow.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}

export default provideGridSystem(
  provideGridScroll(
    PianorollWindow,
    {
      scrollXActionCreator: pianorollScrollX,
      scrollYActionCreator: pianorollScrollY,
      cursorActionCreator: pianorollCursor
    }
  )
)
