import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
import { pianorollScrollX,
         pianorollMoveCursor } from '../actions/actionsPianoroll.js'

import CanvasComponent from './CanvasComponent'

export class PianorollTimelineDisplay extends Component {

  componentDidMount() {
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
  }

  render() {
    return (
      <div className="pianoroll-timeline-display">
        <CanvasComponent renderFrame={this.renderFrame()} />
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = "#282828"
      canvasContext.fillRect( 0, 0, this.props.grid.width, this.props.grid.height )
      this.props.grid.calculateZoomThreshold()
      this.renderBarLines(canvasContext, this.props.xMin, this.props.xMax)
      this.renderClips(canvasContext, this.props.xMin, this.props.xMax, this.props.clips)
    }.bind(this)
  }

  renderBarLines(canvasContext, xMin, xMax) {
    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.font = 11*this.props.grid.pixelScale + "px Helvetica Neue, Helvetica, Arial, sans-serif"
    canvasContext.fillStyle = "#AAAAAA"
    canvasContext.textAlign = "start"

    // Draw lines for each beat
    var minBar = this.props.grid.percentToBar( xMin ) - 1
    var maxBar = this.props.grid.percentToBar( xMax )
    var majorIncrement = this.props.grid.lineThresholdsWithKeys.majorLine
    var minorIncrement = this.props.grid.lineThresholdsWithKeys.minorLine || this.props.grid.lineThresholdsWithKeys.middleLine

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement)

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Start each line as a separate path (different colors)
      let xPosition = closestHalfPixel( this.props.grid.barToXCoord( bar ) )
      let yPosition = 0;

      // Bar Numbers + Major lines
      if( bar % this.props.grid.lineThresholdsWithKeys.majorLine === 0 )
      {
        // Bar Number
        let topEdge  = 14*this.props.grid.pixelScale
        let leftEdge =  4*this.props.grid.pixelScale + xPosition
        let barNumber = Math.floor( bar + 1 )
        let barBeat = ((bar + 1) % 1) * 4 + 1
        let outputText = (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber
        canvasContext.fillText(outputText, leftEdge, topEdge)

        // Bar line style
        canvasContext.strokeStyle = "#555555"
      }
      // Intermediary Bar lines
      else if( bar % this.props.grid.lineThresholdsWithKeys.middleLine === 0 )
      {
        canvasContext.strokeStyle = "#383838"
        yPosition = 18 * this.props.grid.pixelScale
      }
      // Minor lines
      else if( this.props.grid.lineThresholdsWithKeys.minorLine )
      {
        canvasContext.strokeStyle = "#333333"
        yPosition = 20 * this.props.grid.pixelScale
      }

      // Draw each line
      canvasContext.beginPath()
      drawLine( canvasContext, xPosition, yPosition, xPosition, this.props.grid.height )
      canvasContext.stroke()
    }    
  }

  renderClips(canvasContext, xMin, xMax, clips, gradient = true) {
    this.renderClipBoxes(canvasContext, xMin, xMax, clips, gradient)
    this.renderClipSelections(canvasContext, xMin, xMax, clips, gradient)
    this.renderClipLabels(canvasContext, xMin, xMax, clips)
  }

  renderClipBoxes(canvasContext, xMin, xMax, clips, gradient) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = "#000"

    var top = closestHalfPixel( 25*this.props.grid.pixelScale, this.props.grid.pixelScale )
    var bottom = closestHalfPixel( this.props.grid.height + 1*this.props.grid.pixelScale, this.props.grid.pixelScale ) 
    var radius = 3*this.props.grid.pixelScale

    // Gradient Fill
    if (gradient) {
      var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, "#F80");
          gradient.addColorStop(1, "#C60");
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = "#F80"
    }

    // Box
    canvasContext.beginPath()
    clips.forEach(clip => {
      var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
      var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      canvasContext.moveTo(left + radius, top)
      canvasContext.lineTo(right - radius, top)
      canvasContext.quadraticCurveTo(right, top, right, top + radius)
      canvasContext.lineTo(right, bottom)
      canvasContext.lineTo(left, bottom)
      canvasContext.lineTo(left, top + radius)
      canvasContext.quadraticCurveTo(left, top, left + radius, top)
    })
    canvasContext.closePath()
    canvasContext.fill()
    canvasContext.stroke()
  }

  renderClipSelections(canvasContext, xMin, xMax, clips, gradient) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = "#000"

    var top = Math.floor(26.5*this.props.grid.pixelScale)
    var bottom = this.props.grid.height - 1.0*this.props.grid.pixelScale
    var radius = 2*this.props.grid.pixelScale

    // Gradient Fill
    if (gradient) {
      var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, "#630");
          gradient.addColorStop(1, "#520");
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = "#520"
    }

    canvasContext.beginPath()
    clips.filter(clip => clip.selected).forEach(clip => {
      var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
      var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
          left  += closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale)
          right -= closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale)
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      canvasContext.moveTo(left + radius, top)
      canvasContext.lineTo(right - radius, top)
      canvasContext.quadraticCurveTo(right, top, right, top + radius)
      canvasContext.lineTo(right, bottom)
      canvasContext.lineTo(left, bottom)
      canvasContext.lineTo(left, top + radius)
      canvasContext.quadraticCurveTo(left, top, left + radius, top)
    })
    canvasContext.closePath()
    canvasContext.fill()
  }

  renderClipLabels(canvasContext, xMin, xMax, clips) {
    var bottom = this.props.grid.height + 1*this.props.grid.pixelScale

    clips.forEach(clip => {
      var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
      var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      canvasContext.fillStyle = clip.selected ? "#F80" : "#000"
      canvasContext.textAlign = "start"
      let x = left   + 6*this.props.grid.pixelScale
      let y = bottom - 9*this.props.grid.pixelScale
      canvasContext.fillText(`Clip ${clip.id}`, x, y)
    })
  }
}

PianorollTimelineDisplay.propTypes = {
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array.isRequired
};

export default provideGridSystem(PianorollTimelineDisplay)
