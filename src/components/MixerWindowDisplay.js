// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react';
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash'
import { closestHalfPixel,
         drawLine,
         drawRoundedRectangle } from '../helpers/canvasHelpers.js'
import { getTrackHeight,
         getTracksHeight,
         getDarkenedColor } from '../helpers/trackHelpers.js'

import CanvasComponent from './CanvasComponent'

export class MixerWindowDisplay extends Component {

  componentDidMount() {
    this.props.grid.marginLeft   = 10;
    this.props.grid.marginRight  = 7;
  }

  render() {
    return (
      <div className="mixer-window-display">
        <CanvasComponent renderFrame={this.renderFrame()} />
      </div>
    );
  }

  renderFrame() {
    return function(canvasContext) {
      canvasContext.fillStyle = '#444444';
      canvasContext.fillRect( 0, 0, this.props.grid.width, this.props.grid.height );
      this.props.grid.calculateZoomThreshold();
      this.renderTimeline(canvasContext, this.props.xMin, this.props.xMax)
      this.renderClips(canvasContext,
        this.props.xMin,
        this.props.xMax,
        this.props.yMin,
        this.props.yMax,
        this.props.tracks,
        this.props.clips
      )
    }.bind(this);
  }

  renderTimeline(canvasContext, xMin, xMax) {
    // Draw lines for each beat
    canvasContext.lineWidth = 1.0;
    var minBar = this.props.grid.percentToBar( xMin ) - 1;
    var maxBar = this.props.grid.percentToBar( xMax );
    var minorIncrement = this.props.grid.lineThresholdsNoKeys.minorLine || this.props.grid.lineThresholdsNoKeys.middleLine;

    // Ensure we increment off a common denominator
    minBar = minBar - (minBar % minorIncrement);

    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.props.grid.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.props.grid.lineThresholdsNoKeys.majorLine === 0 )
        canvasContext.strokeStyle = '#222222';
      // Intermediary Bar lines
      else if( bar % this.props.grid.lineThresholdsNoKeys.middleLine === 0 )
        canvasContext.strokeStyle = '#333333';
      // Minor Bar lines
      else if( this.props.grid.lineThresholdsNoKeys.minorLine )
        canvasContext.strokeStyle = '#3C3C3C';

      canvasContext.beginPath();
      drawLine( canvasContext, xPosition, 0, xPosition, this.props.grid.height );
      canvasContext.stroke();
    }    
  }

  renderClips(canvasContext, xMin, xMax, yMin, yMax, tracks, clips) {
    canvasContext.lineWidth = this.props.grid.pixelScale
    canvasContext.font = 11*this.props.grid.pixelScale + 'px Helvetica Neue, Helvetica, Arial, sans-serif'

    var contentHeight = getTracksHeight(tracks)*this.props.grid.pixelScale
    var startingEdge = 0 - contentHeight * yMin
    var radius = 6

    // Iterate through each track
    tracks.reduce((currentEdge, track) => {
      var trackHeight = getTrackHeight(track)*this.props.grid.pixelScale
      var nextEdge = currentEdge + trackHeight

      // Skip tracks that are out of view
      if (nextEdge < 0 || currentEdge > this.props.grid.height)
        return nextEdge

      // Render all 
      let top = closestHalfPixel( currentEdge + 7 * this.props.grid.pixelScale, this.props.grid.pixelScale )
      let bottom = closestHalfPixel( nextEdge - 5 * this.props.grid.pixelScale, this.props.grid.pixelScale )
      clips.forEach(clip => {
        // Filter by current track
        if (clip.trackID != track.id)
          return

        var left   = closestHalfPixel( this.props.grid.barToXCoord( clip.start ), this.props.grid.pixelScale )
        var right  = closestHalfPixel( this.props.grid.barToXCoord( clip.end   ), this.props.grid.pixelScale )
        // Don't waste CPU cycles drawing stuff that's not visible
        if (right < 0 || left > this.props.grid.width)
          return

        this.renderClip(canvasContext, clip, left, right, top, bottom, radius, track.color)
      })

      return nextEdge
    }, startingEdge)
  }

  renderClip(canvasContext, clip, left, right, top, bottom, radius, color, gradient = true) {
    // Shape + gradient fill
    canvasContext.strokeStyle = '#000'
    if (gradient) {
      let gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, getDarkenedColor(color, 0.266));
      canvasContext.fillStyle = gradient
    } else {
      canvasContext.fillStyle = color
    }
    drawRoundedRectangle(
      canvasContext,
      left,
      right,
      top,
      bottom,
      radius * this.props.grid.pixelScale
    )

    // Selected
    if (clip.selected) {
      if (gradient) {
        let gradient = canvasContext.createLinearGradient(0, top, 0, bottom);
            gradient.addColorStop(0, getDarkenedColor(color, 0.533));
            gradient.addColorStop(1, getDarkenedColor(color, 0.733));
        canvasContext.fillStyle = gradient
      } else {
        canvasContext.fillStyle = getDarkenedColor(color, 0.733)
      }
      canvasContext.strokeStyle = 'transparent'
      drawRoundedRectangle(canvasContext,
        left   + closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        right  - closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        top    + closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        bottom - closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        (radius - 1.0)*this.props.grid.pixelScale
      )
    }

    // Loop Lines
    var currentLoopStart = clip.start + clip.offset + clip.loopLength
    var currentLoopStartCutoff = clip.start - currentLoopStart                      // Used to check if a note is cut off at the beginning of the current loop iteration
    var currentLoopEndCutoff   = Math.min(clip.loopLength, clip.end - currentLoopStart) // Used to check if a note is cut off at the end of the current loop iteration
    while( currentLoopStart < clip.end ) {
      // Draw current line
      var currentLoopLine = closestHalfPixel( this.props.grid.barToXCoord( currentLoopStart ), this.props.grid.pixelScale )
      drawLine(
        canvasContext,
        currentLoopLine,
        top    + closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        currentLoopLine,
        bottom - closestHalfPixel(1.5*this.props.grid.pixelScale, this.props.grid.pixelScale),
        [2, 2],
        clip.selected ? color : '#000'
      )

      // Next iteration
      currentLoopStart += clip.loopLength
      currentLoopStartCutoff = 0
      currentLoopEndCutoff = Math.min(clip.loopLength, clip.end - currentLoopStart)
    }    

    // Label
    if (right - left > 30*this.props.grid.pixelScale) {
      canvasContext.fillStyle = clip.selected ? color : '#000'
      canvasContext.textAlign = 'start'
      let x = left + 5*this.props.grid.pixelScale
      let y = top  + 14*this.props.grid.pixelScale
      canvasContext.fillText(`Clip ${clip.id}`, x, y)
    }
  }

  shouldComponentUpdate(nextProps) {
    var propsToCheck = [
      'dispatch',
      'grid',
      'tracks',
      'clips',
      'barCount',
      'xMin',
      'xMax',
      'yMin',
      'yMax'
    ]
    var changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    return changeDetected    
  }
}

MixerWindowDisplay.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  tracks:       React.PropTypes.array.isRequired,
  clips:        React.PropTypes.array.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}

export default provideGridSystem(MixerWindowDisplay)
