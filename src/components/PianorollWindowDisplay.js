import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'

import _ from 'lodash'
import { closestHalfPixel,
         drawLine,
         drawRoundedRectangle } from '../helpers/canvasHelpers.js'

import CanvasComponent from './CanvasComponent'

export class PianorollWindow extends Component {

  componentDidMount() {
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom = 30
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
  }

  shouldComponentUpdate(nextProps) {
    var propsToCheck = [
      'barCount',
      'keyCount',
      'xMin',
      'xMax',
      'yMin',
      'yMax',
      'notes'
    ]
    var changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    return changeDetected
  }

  render() {
    return (
      <div className="pianoroll-window-display">
        <CanvasComponent renderFrame={this.renderFrame()} />
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.clearRect( 0, 0, this.props.grid.width, this.props.grid.height )
      this.props.grid.calculateZoomThreshold();
      this.renderKeyLines(canvasContext, this.props.yMin, this.props.yMax)
      this.renderBarLines(canvasContext, this.props.xMin, this.props.xMax)
      this.renderClips(canvasContext,
        this.props.xMin,
        this.props.xMax,
        this.props.clips
      )
      this.renderNotes(canvasContext,
        this.props.xMin,
        this.props.xMax,
        this.props.yMin,
        this.props.yMax,
        this.props.notes
      )
    }.bind(this)
  }

  renderBarLines(canvasContext, xMin, xMax) {
    // TODO: Missing dependencies, temporarily stubbed
    var key = { alt: false }

    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.setLineDash( key.alt ? [2,4] : [] )
    canvasContext.font = 11*this.props.grid.pixelScale + "pleft Helvetica Neue, Helvetica, Arial, sans-serif"
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
    var bottomLimit = closestHalfPixel( this.props.grid.height - (30 * this.props.grid.pixelScale) )
    for( var key = minKey; key - 1 <= maxKey; key++ )
    {
      var prevEdge = closestHalfPixel( this.props.grid.keyToYCoord( key - 1 ) ) + 1   // Extra pixel to account for stroke width
      var nextEdge = closestHalfPixel( this.props.grid.keyToYCoord( key     ) ) + 1   // Extra pixel to account for stroke width
          nextEdge = Math.min(nextEdge, bottomLimit)

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

      // Don't draw keys into the horizontal scrollbar
      if( nextEdge == bottomLimit )
        break
    }

    // One final stroke to end the last octave!
    canvasContext.stroke()
  }

  renderClips(canvasContext, xMin, xMax, clips) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = "#000"
    canvasContext.fillStyle   = "rgba(255, 127, 0, 0.125)"

    canvasContext.beginPath()
    clips.forEach(clip => {
      var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
      var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      drawLine( canvasContext, left,  0, left,  this.props.grid.height - 30*this.props.grid.pixelScale )
      drawLine( canvasContext, right, 0, right, this.props.grid.height - 30*this.props.grid.pixelScale )
      canvasContext.fillRect(   left, 0, right - left, this.props.grid.height - 30*this.props.grid.pixelScale )
    })
    canvasContext.closePath()
    canvasContext.stroke()
  }

  renderNotes(canvasContext, xMin, xMax, yMin, yMax, notes) {
    var keyboardHeight = this.props.grid.getActiveHeight() / this.props.grid.getKeyRange()
    var keyHeight = keyboardHeight / this.props.keyCount
    var fontSize = keyHeight - 8.5*this.props.grid.pixelScale + 2*this.props.grid.pixelScale
    canvasContext.font = fontSize + "px Helvetica Neue, Helvetica, Arial, sans-serif"
    canvasContext.lineWidth = this.props.grid.pixelScale

    notes.forEach(note => {
      var top    = closestHalfPixel( this.props.grid.keyToYCoord( this.props.keyCount - note.keyNum     ), this.props.grid.pixelScale ) + 1   // Extra pixel to account for stroke width
      var bottom = closestHalfPixel( this.props.grid.keyToYCoord( this.props.keyCount - note.keyNum + 1 ), this.props.grid.pixelScale ) + 1   // Extra pixel to account for stroke width
      // Don't waste CPU cycles drawing stuff that's not visible
      if (bottom < 0 || top > this.props.grid.height)
        return

      var left   = closestHalfPixel( this.props.grid.barToXCoord( note.start      ), this.props.grid.pixelScale )
      var right  = closestHalfPixel( this.props.grid.barToXCoord( note.end        ), this.props.grid.pixelScale )
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      var label
      if (keyboardHeight > 1275*this.props.grid.pixelScale) {
        let keyLetter = {1:'A',2:'A#',3:'B',4:'C',5:'C#',6:'D',7:'D#',8:'E',9:'F',10:'F#',11:'G',0:'G#'}[note.keyNum % 12];
        label = keyLetter + Math.floor((note.keyNum+8)/12);
      }

      this.renderNote(canvasContext, left, right, top, bottom, note.selected, label)
    })
  }

  renderNote(canvasContext, left, right, top, bottom, selected, label, gradient = true) {
    // Gradient Fill
    if (gradient) {
      var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, "#F80");
          gradient.addColorStop(1, "#C60");
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = "#F80"
    }

    // Stroke
    canvasContext.strokeStyle = "#000"

    // Dimensions
    var width = right - left
    var height = bottom - top
    var radius = height * 0.175

    // Shape
    drawRoundedRectangle(canvasContext, left, right, top, bottom, radius)

    // Selected
    if (selected) {
      if (gradient) {
        var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
            gradient.addColorStop(0, "#630");
            gradient.addColorStop(1, "#520");
        canvasContext.fillStyle = gradient
      } else {
        canvasContext.fillStyle = "#520"
      }
      canvasContext.strokeStyle = 'transparent'
      drawRoundedRectangle(canvasContext,
        left   + closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        right  - closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        top    + closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        bottom - closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        radius - 1.0*this.props.grid.pixelScale
      )
    }

    // Label
    if (label && width > 30*this.props.grid.pixelScale) {
      canvasContext.fillStyle = selected ? "#F80" : "#000"
      canvasContext.textAlign = "start"
      let x = left   + 4*this.props.grid.pixelScale
      let y = bottom - 5*this.props.grid.pixelScale
      canvasContext.fillText(label, x, y)
    }
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
  yMax:         React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array.isRequired
}

export default provideGridSystem(PianorollWindow)
