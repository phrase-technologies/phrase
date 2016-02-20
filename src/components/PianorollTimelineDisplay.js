import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'
import provideTween from './TweenProvider.js'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
import { pianorollScrollX,
         pianorollMoveCursor } from '../actions/actionsPianoroll.js'
import { getDarkenedColor } from '../helpers/trackHelpers.js'

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
    var topBox = closestHalfPixel( 25*this.props.grid.pixelScale, this.props.grid.pixelScale )
    var bottomBox = closestHalfPixel( this.props.grid.height + 1*this.props.grid.pixelScale, this.props.grid.pixelScale ) 
    var radiusBox = 6*this.props.grid.pixelScale
    var topSelection = Math.floor(26.5*this.props.grid.pixelScale)
    var bottomSelection = this.props.grid.height - 1.0*this.props.grid.pixelScale
    var radiusSelection = 5*this.props.grid.pixelScale
    var bottomLabel = this.props.grid.height + 1*this.props.grid.pixelScale

    clips.forEach(clip => {
      this.renderClipBox(      canvasContext, xMin, xMax, clip, topBox, bottomBox, radiusBox, this.props.currentTrack.color, gradient)
      this.renderClipSelection(canvasContext, xMin, xMax, clip, topSelection, bottomSelection, radiusSelection, this.props.currentTrack.color, gradient)
      this.renderClipLabel(    canvasContext, xMin, xMax, clip, bottomLabel, this.props.currentTrack.color)
      this.renderClipLoopLines(canvasContext, xMin, xMax, clip, topSelection, bottomSelection, this.props.currentTrack.color)
    })
  }

  renderClipBox(canvasContext, xMin, xMax, clip, top, bottom, radius, color, gradient) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = "#000"

    // Gradient Fill
    if (gradient) {
      var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, getDarkenedColor(color, 0.266));
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = color
    }

    // Box
    canvasContext.beginPath()
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
    canvasContext.closePath()
    canvasContext.fill()
    canvasContext.stroke()
  }

  renderClipSelection(canvasContext, xMin, xMax, clip, top, bottom, radius, color, gradient) {
    if (!clip.selected)
      return

    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = "#000"

    // Gradient Fill
    if (gradient) {
      var gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, getDarkenedColor(color, 0.533));
          gradient.addColorStop(1, getDarkenedColor(color, 0.733));
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = getDarkenedColor(color, 0.733)
    }

    canvasContext.beginPath()
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
    canvasContext.closePath()
    canvasContext.fill()
  }

  renderClipLabel(canvasContext, xMin, xMax, clip, bottom, color) {
    var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
    var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
    // Don't waste CPU cycles drawing stuff that's not visible
    if (right < 0 || left > this.props.grid.width)
      return

    canvasContext.fillStyle = clip.selected ? color : "#000"
    canvasContext.textAlign = "start"
    let x = left   + 6*this.props.grid.pixelScale
    let y = bottom - 9*this.props.grid.pixelScale
    canvasContext.fillText(`Clip ${clip.id}`, x, y)
  }

  renderClipLoopLines(canvasContext, xMin, xMax, clip, top, bottom, color) {
    var currentLoopStart = clip.start + clip.offset + clip.loopLength
    var currentLoopStartCutoff = clip.start - currentLoopStart                      // Used to check if a note is cut off at the beginning of the current loop iteration
    var currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
    while( currentLoopStart < clip.end ) {
      // Draw current line
      var currentLoopLine = closestHalfPixel( this.props.grid.barToXCoord( currentLoopStart ), this.props.grid.pixelScale )
      drawLine( canvasContext, currentLoopLine, bottom, currentLoopLine, top, [2, 2], clip.selected ? color : "#000")

      // Next iteration
      currentLoopStart += clip.loopLength
      currentLoopStartCutoff = 0
      currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
    }
  }
}

PianorollTimelineDisplay.propTypes = {
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  currentTrack: React.PropTypes.object.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array.isRequired
};

export default provideTween(
  ["xMin", "xMax"],
  provideGridSystem(
    PianorollTimelineDisplay
  )
)
