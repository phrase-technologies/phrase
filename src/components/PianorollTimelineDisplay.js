import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'
import provideTween from './TweenProvider.js'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
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
    )
  }

  renderFrame() {
    return function(canvasContext) {
      let mobile = this.props.grid.height < 40 * this.props.grid.pixelScale
      canvasContext.fillStyle = '#282828'
      canvasContext.fillRect(0, 0, this.props.grid.width, this.props.grid.height)
      this.props.grid.calculateZoomThreshold()
      this.renderBarLines(canvasContext, this.props.xMin, this.props.xMax, mobile)
      this.renderClips(canvasContext, this.props.xMin, this.props.xMax, this.props.clips, mobile)
    }.bind(this)
  }

  renderBarLines(canvasContext, xMin, xMax, mobile) {
    let fontSize =  mobile ? 8 : 11
    let fontTop  = (mobile ? 9 : 14) * this.props.grid.pixelScale
    let topEdge  = (mobile ? 7 : 14) * this.props.grid.pixelScale

    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.font = fontSize*this.props.grid.pixelScale + 'px Helvetica Neue, Helvetica, Arial, sans-serif'
    canvasContext.fillStyle = '#AAAAAA'
    canvasContext.textAlign = 'start'

    // Draw lines for each beat
    let minBar = this.props.grid.percentToBar(xMin) - 1
    let maxBar = this.props.grid.percentToBar(xMax)
    let majorIncrement = this.props.grid.lineThresholdsWithKeys.majorLine
    let minorIncrement = this.props.grid.lineThresholdsWithKeys.minorLine || this.props.grid.lineThresholdsWithKeys.middleLine

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement)

    for (let bar = minBar; bar <= maxBar; bar += minorIncrement)
    {
      // Start each line as a separate path (different colors)
      let xPosition = closestHalfPixel(this.props.grid.barToXCoord(bar))
      let yPosition = 0

      // Bar Numbers + Major lines
      if (bar % this.props.grid.lineThresholdsWithKeys.majorLine === 0)
      {
        // Bar Number
        let leftEdge =  4*this.props.grid.pixelScale + xPosition
        let barNumber = Math.floor(bar + 1)
        let barBeat = ((bar + 1) % 1) * 4 + 1
        let outputText = (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber
        canvasContext.fillText(outputText, leftEdge, fontTop)

        // Bar line style
        canvasContext.strokeStyle = '#555555'
      }
      // Intermediary Bar lines
      else if (bar % this.props.grid.lineThresholdsWithKeys.middleLine === 0)
      {
        canvasContext.strokeStyle = '#383838'
        yPosition = topEdge + 4 * this.props.grid.pixelScale
      }
      // Minor lines
      else if (this.props.grid.lineThresholdsWithKeys.minorLine)
      {
        canvasContext.strokeStyle = '#333333'
        yPosition = topEdge + 6 * this.props.grid.pixelScale
      }

      // Draw each line
      canvasContext.beginPath()
      drawLine(canvasContext, xPosition, yPosition, xPosition, this.props.grid.height)
      canvasContext.stroke()
    }
  }

  renderClips(canvasContext, xMin, xMax, clips, mobile, gradient = true) {
    let topBase = mobile ? 15 : 25

    let topBox = closestHalfPixel(topBase*this.props.grid.pixelScale, this.props.grid.pixelScale)
    let bottomBox = closestHalfPixel(this.props.grid.height + 1*this.props.grid.pixelScale, this.props.grid.pixelScale)
    let radiusBox = 6*this.props.grid.pixelScale
    let topSelection = Math.floor((topBase + 1.5) * this.props.grid.pixelScale)
    let bottomSelection = this.props.grid.height - 1.0*this.props.grid.pixelScale
    let radiusSelection = 5*this.props.grid.pixelScale

    clips.forEach(clip => {
      this.renderClipBox(canvasContext, xMin, xMax, clip, topBox, bottomBox, radiusBox, this.props.currentTrack.color, gradient)
      this.renderClipSelection(canvasContext, xMin, xMax, clip, topSelection, bottomSelection, radiusSelection, this.props.currentTrack.color, gradient)
      this.renderClipLabel(canvasContext, xMin, xMax, clip, this.props.currentTrack.color, mobile)
      this.renderClipLoopLines(canvasContext, xMin, xMax, clip, topSelection, bottomSelection, this.props.currentTrack.color)
    })
  }

  renderClipBox(canvasContext, xMin, xMax, clip, top, bottom, radius, color, gradient) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.strokeStyle = '#000'

    // Gradient Fill
    if (gradient) {
      let gradient = canvasContext.createLinearGradient(0, top, 0, bottom)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, getDarkenedColor(color, 0.266))
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = color
    }

    // Box
    canvasContext.beginPath()
    let left   = closestHalfPixel(this.props.grid.barToXCoord(clip.start), this.props.grid.pixelScale)
    let right  = closestHalfPixel(this.props.grid.barToXCoord(clip.end), this.props.grid.pixelScale)
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
    canvasContext.strokeStyle = '#000'

    // Gradient Fill
    if (gradient) {
      let gradient = canvasContext.createLinearGradient(0, top, 0, bottom)
          gradient.addColorStop(0, getDarkenedColor(color, 0.533))
          gradient.addColorStop(1, getDarkenedColor(color, 0.733))
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = getDarkenedColor(color, 0.666)
    }

    canvasContext.beginPath()
    let left   = closestHalfPixel(this.props.grid.barToXCoord(clip.start), this.props.grid.pixelScale)
    let right  = closestHalfPixel(this.props.grid.barToXCoord(clip.end), this.props.grid.pixelScale)
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

  renderClipLabel(canvasContext, xMin, xMax, clip, color, mobile) {
    let left   = closestHalfPixel(this.props.grid.barToXCoord(clip.start), this.props.grid.pixelScale)
    let right  = closestHalfPixel(this.props.grid.barToXCoord(clip.end), this.props.grid.pixelScale)
    // Don't waste CPU cycles drawing stuff that's not visible
    if (right < 0 || left > this.props.grid.width)
      return

    canvasContext.fillStyle = clip.selected ? color : '#000'
    canvasContext.textAlign = 'start'
    let x = left + (mobile ? 3 : 6) * this.props.grid.pixelScale
    let y = (mobile ? 25 : 41) * this.props.grid.pixelScale
    canvasContext.fillText(`Clip ${clip.id}`, x, y)
  }

  renderClipLoopLines(canvasContext, xMin, xMax, clip, top, bottom, color) {
    let currentLoopStart = clip.start + clip.offset + clip.loopLength
    while (currentLoopStart < clip.end) {
      // Draw current line
      let currentLoopLine = closestHalfPixel(this.props.grid.barToXCoord(currentLoopStart), this.props.grid.pixelScale)
      drawLine(canvasContext, currentLoopLine, bottom, currentLoopLine, top, [2, 2], clip.selected ? color : '#000')

      // Next iteration
      currentLoopStart += clip.loopLength
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
}

export default provideTween(
  ['xMin', 'xMax'],
  provideGridSystem(
    PianorollTimelineDisplay
  )
)
