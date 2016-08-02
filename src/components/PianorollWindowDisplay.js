import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider.js'
import provideTween from './TweenProvider.js'

import {
  closestHalfPixel,
  drawLine,
  drawRoundedRectangle
} from 'helpers/canvasHelpers'

import { getDarkenedColor, desaturateFromVelocity } from 'helpers/trackHelpers'

import CanvasComponent from './CanvasComponent'

export class PianorollWindowDisplay extends Component {

  componentDidMount() {
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom =  0
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
  }

  shouldComponentUpdate(nextProps) {
    let propsToCheck = [
      'barCount',
      'keyCount',
      'xMin',
      'xMax',
      'yMin',
      'yMax',
      'notes'
    ]
    let changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] !== this.props[prop]
    })
    return changeDetected
  }

  render() {
    return (
      <div className="pianoroll-window-display">
        <CanvasComponent renderFrame={this.renderFrame()} />
      </div>
    )
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.clearRect(0, 0, this.props.grid.width, this.props.grid.height)
      this.props.grid.calculateZoomThreshold()
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
    let key = { alt: false }

    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.setLineDash(key.alt ? [2,4] : [])
    canvasContext.font = 11*this.props.grid.pixelScale + 'pleft Helvetica Neue, Helvetica, Arial, sans-serif'
    canvasContext.fillStyle = '#AAAAAA'
    canvasContext.textAlign = 'start'

    // Draw lines for each beat
    let minBar = this.props.grid.percentToBar(xMin) - 1
    let maxBar = this.props.grid.percentToBar(xMax)
    let minorIncrement = this.props.grid.lineThresholdsWithKeys.minorLine || this.props.grid.lineThresholdsWithKeys.middleLine

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement)

    for (let bar = minBar; bar <= maxBar; bar += minorIncrement)
    {
      // Draw each line as a separate path (different colors)
      let xPosition = closestHalfPixel(this.props.grid.barToXCoord(bar))

      // Major Bar lines
      if (bar % this.props.grid.lineThresholdsWithKeys.majorLine === 0)
        canvasContext.strokeStyle = '#222222'
      // Intermediary Bar lines
      else if (bar % this.props.grid.lineThresholdsWithKeys.middleLine === 0)
        canvasContext.strokeStyle = '#333333'
      // Minor Bar lines
      else if (this.props.grid.lineThresholdsWithKeys.minorLine)
        canvasContext.strokeStyle = '#383838'

      // Draw each line (different colors)
      canvasContext.beginPath()
      drawLine(canvasContext, xPosition, 0, xPosition, this.props.grid.height)
      canvasContext.stroke()
    }
  }

  renderKeyLines(canvasContext, yMin, yMax) {
    // Styles
    canvasContext.lineWidth   = 1.0
    canvasContext.setLineDash([])
    canvasContext.strokeStyle = '#393939'
    canvasContext.fillStyle   = '#3D3D3D'

    // Each edge + black key fills
    let minKey = this.props.grid.percentToKey(yMin)
    let maxKey = this.props.grid.percentToKey(yMax)
    for (let key = minKey; key - 1 <= maxKey; key++) {
      let prevEdge = closestHalfPixel(this.props.grid.keyToYCoord(key - 8 - 1)) + 1   // Extra pixel to account for stroke width, offset key by 8 due to 1st key = MIDI #9
      let nextEdge = closestHalfPixel(this.props.grid.keyToYCoord(key - 8))     + 1   // Extra pixel to account for stroke width, offset key by 8 due to 1st key = MIDI #9

      // Stroke the edge between rows
      drawLine(canvasContext, 0, prevEdge, this.props.grid.width, prevEdge, false)

      // Fill the row for the black keys
      if (key % 12 in { 3:true, 5:true, 7: true, 10: true, 0: true })
        canvasContext.fillRect(0, nextEdge, this.props.grid.width, prevEdge - nextEdge)

      // Stroke it each octave to get different colours
      if (key % 12 === 1) {
        canvasContext.stroke()
        canvasContext.beginPath()
        canvasContext.strokeStyle = '#222222'
      } else if (key % 12 === 2) {
        canvasContext.stroke()
        canvasContext.beginPath()
        canvasContext.strokeStyle = '#393939'
      }
    }

    // One final stroke to end the last octave!
    canvasContext.stroke()
  }

  renderClips(canvasContext, xMin, xMax, clips) {
    clips.forEach(clip => {
      let left   = closestHalfPixel(this.props.grid.barToXCoord(clip.start), this.props.grid.pixelScale)
      let right  = closestHalfPixel(this.props.grid.barToXCoord(clip.end),   this.props.grid.pixelScale)
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      // Start/End lines + background
      canvasContext.lineWidth = this.props.grid.pixelScale
      canvasContext.strokeStyle = '#000'
      canvasContext.fillStyle   = getDarkenedColor(this.props.currentTrack.color, 0.0, 0.125)
      canvasContext.beginPath()
      drawLine(canvasContext, left,  0, left,  this.props.grid.height)
      drawLine(canvasContext, right, 0, right, this.props.grid.height)
      canvasContext.fillRect(left, 0, right - left, this.props.grid.height)
      canvasContext.closePath()
      canvasContext.stroke()

      // Loop Lines
      let currentLoopStart = clip.start + clip.offset + clip.loopLength
      let currentLoopStartCutoff = clip.start - currentLoopStart // Used to check if a note is cut off at the beginning of the current loop iteration
      let currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
      while (currentLoopStart < clip.end) {
        // Draw current line
        let currentLoopLine = closestHalfPixel(this.props.grid.barToXCoord(currentLoopStart), this.props.grid.pixelScale)
        drawLine(canvasContext, currentLoopLine, 0, currentLoopLine, this.props.grid.height, [2, 2], '#000')

        // Next iteration
        currentLoopStart += clip.loopLength
        currentLoopStartCutoff = 0
        currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
      }
    })
  }

  renderNotes(canvasContext, xMin, xMax, yMin, yMax, notes) {
    let { currentTrack } = this.props

    let keyboardHeight = this.props.grid.getActiveHeight() / this.props.grid.getKeyRange()
    let keyHeight = keyboardHeight / this.props.keyCount
    let fontSize = keyHeight - 8.5*this.props.grid.pixelScale + 2*this.props.grid.pixelScale
    canvasContext.font = fontSize + 'px Helvetica Neue, Helvetica, Arial, sans-serif'
    canvasContext.lineWidth = this.props.grid.pixelScale

    notes &&
    notes.forEach(note => {
      let top    = closestHalfPixel(this.props.grid.keyToYCoord(this.props.keyCount - note.keyNum),     this.props.grid.pixelScale) + 1   // Extra pixel to account for stroke width
      let bottom = closestHalfPixel(this.props.grid.keyToYCoord(this.props.keyCount - note.keyNum + 1), this.props.grid.pixelScale) + 1   // Extra pixel to account for stroke width
      // Don't waste CPU cycles drawing stuff that's not visible
      if (bottom < 0 || top > this.props.grid.height)
        return

      let left   = closestHalfPixel(this.props.grid.barToXCoord(note.start), this.props.grid.pixelScale)
      let right  = closestHalfPixel(this.props.grid.barToXCoord(note.end),   this.props.grid.pixelScale)
      // Don't waste CPU cycles drawing stuff that's not visible
      if (right < 0 || left > this.props.grid.width)
        return

      let label
      if (keyboardHeight > 1275*this.props.grid.pixelScale) {
        let keyLetter = {1:'A',2:'A#',3:'B',4:'C',5:'C#',6:'D',7:'D#',8:'E',9:'F',10:'F#',11:'G',0:'G#'}[note.keyNum % 12]
        label = keyLetter + Math.floor((note.keyNum+8)/12)
      }

      let color = desaturateFromVelocity(currentTrack.color, note.velocity)

      this.renderNote({
        canvasContext,
        left, right, top, bottom,
        note,
        label,
        color,
        leftCutoff: note.outOfViewLeft,
        rightCutoff: note.outOfViewRight
      })
    })
  }

  renderNote({
    canvasContext,
    left, right, top, bottom,
    note,
    label,
    color,
    leftCutoff = false,
    rightCutoff = false,
    gradient = true
  }) {
    // Gradient Fill
    if (gradient) {
      let gradient = canvasContext.createLinearGradient(0, top, 0, bottom)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, getDarkenedColor(color, 0.266))
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = color
    }

    // Stroke
    canvasContext.strokeStyle = '#000'

    // Dimensions
    let width = right - left
    let height = bottom - top
    let radius = height * 0.175

    // Shape
    drawRoundedRectangle(canvasContext, left, right, top, bottom, radius, leftCutoff, rightCutoff)

    // Selected
    if (note.selected) {
      if (gradient) {
        let gradient = canvasContext.createLinearGradient(0, top, 0, bottom)
        if (note.selected === "faded") {
          gradient.addColorStop(0, getDarkenedColor(color, 0.266))
          gradient.addColorStop(1, getDarkenedColor(color, 0.466))
        } else {
          gradient.addColorStop(0, getDarkenedColor(color, 0.533))
          gradient.addColorStop(1, getDarkenedColor(color, 0.733))
        }
        canvasContext.fillStyle = gradient
      } else {
        canvasContext.fillStyle = (selected === "faded")
          ? getDarkenedColor(color, 0.266)
          : getDarkenedColor(color, 0.666)
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
      canvasContext.fillStyle = note.selected ? color : '#000'
      canvasContext.textAlign = 'start'
      let x = left   + 4*this.props.grid.pixelScale
      let y = bottom - 5*this.props.grid.pixelScale
      canvasContext.fillText(label, x, y)
    }
  }
}


PianorollWindowDisplay.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  currentTrack: React.PropTypes.object.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array.isRequired,
  notes:        React.PropTypes.array.isRequired
}

export default provideTween(
  ['xMin', 'xMax'],
  provideGridSystem(
    PianorollWindowDisplay
  )
)
