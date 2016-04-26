import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
import { mixerScrollX,
         mixerMoveCursor,
       } from '../reducers/reduceMixer.js'

import CanvasComponent from './CanvasComponent'

export class MixerTimeline extends Component {

  componentDidMount() {
    this.props.grid.marginLeft   = 11
    this.props.grid.marginRight  = 12
  }

  render() {
    return (
      <div className="mixer-timeline">
        <CanvasComponent renderFrame={this.renderFrame()} />
        {this.props.children}
      </div>
    )
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = '#282828'
      canvasContext.fillRect( 0, 0, this.props.grid.width, this.props.grid.height )
      this.props.grid.calculateZoomThreshold()
      this.renderBarLines(canvasContext, this.props.xMin, this.props.xMax)
    }.bind(this)
  }

  renderBarLines(canvasContext, xMin, xMax) {
    // Styles
    canvasContext.lineWidth = 1.0
    canvasContext.font = 11*this.props.grid.pixelScale + 'px Helvetica Neue, Helvetica, Arial, sans-serif'
    canvasContext.fillStyle = '#AAAAAA'
    canvasContext.textAlign = 'start'

    // Draw lines for each beat
    var minBar = this.props.grid.percentToBar( xMin ) - 1
    var maxBar = this.props.grid.percentToBar( xMax )
    var majorIncrement = this.props.grid.lineThresholdsNoKeys.majorLine
    var minorIncrement = this.props.grid.lineThresholdsNoKeys.minorLine || this.props.grid.lineThresholdsNoKeys.middleLine

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement)

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Start each line as a separate path (different colors)
      let xPosition = closestHalfPixel( this.props.grid.barToXCoord( bar ) )
      let yPosition = 0

      // Bar Numbers + Major lines
      if( bar % this.props.grid.lineThresholdsNoKeys.majorLine === 0 )
      {
        // Bar Number
        let topEdge  = 14*this.props.grid.pixelScale
        let leftEdge =  4*this.props.grid.pixelScale + xPosition
        let barNumber = Math.floor( bar + 1 )
        let barBeat = ((bar + 1) % 1) * 4 + 1
        let outputText = (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber
        canvasContext.fillText(outputText, leftEdge, topEdge)

        // Bar line style
        canvasContext.strokeStyle = '#555555'
      }
      // Intermediary Bar lines
      else if( bar % this.props.grid.lineThresholdsNoKeys.middleLine === 0 )
      {
        canvasContext.strokeStyle = '#383838'
        yPosition = 18 * this.props.grid.pixelScale
      }
      // Minor lines
      else if( this.props.grid.lineThresholdsNoKeys.minorLine )
      {
        canvasContext.strokeStyle = '#333333'
        yPosition = 20 * this.props.grid.pixelScale
      }

      // Draw each line
      canvasContext.beginPath()
      drawLine( canvasContext, xPosition, yPosition, xPosition, this.props.grid.height )
      canvasContext.stroke()
    }
  }

  shouldComponentUpdate(nextProps) {
    var propsToCheck = [
      'dispatch',
      'grid',
      'barCount',
      'xMin',
      'xMax'
    ]
    var changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    return changeDetected
  }
}

MixerTimeline.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  xMin:       React.PropTypes.number.isRequired,
  xMax:       React.PropTypes.number.isRequired
}

export default provideGridSystem(
  provideGridScroll(
    MixerTimeline,
    {
      scrollXActionCreator: mixerScrollX,
      cursorActionCreator: mixerMoveCursor
    }
  )
)
