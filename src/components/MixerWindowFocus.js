import React, { Component } from 'react'

import _ from 'lodash'
import { getPixelsToTrack,
         getTracksHeight } from '../helpers/trackHelpers.js'

export default class MixerWindowFocus extends Component {

  render() {
    if (this.props.focusedTrack === null)
      return null

    var {tracks, focusedTrack, focusBarMin, focusBarMax, xMin, xMax, yMin, yMax} = this.props
    var left  = (focusBarMin - xMin)/(xMax - xMin)
    var right = (xMax - focusBarMax)/(xMax - xMin)
    var width = 1 - right - left
    var height = 46
    var pixelsToFocusedTrack = 4 + getPixelsToTrack(tracks, focusedTrack)
    var contentHeight = getTracksHeight(tracks)
    var top = pixelsToFocusedTrack - contentHeight*yMin

    // If Focus is shifted via clip selection - use CSS transitions for smooth shift (in mixer.scss)
    var boxStyle = {
      top: top,
      left: left*100+'%',
      width: width*100 + '%',
      height: height
    }

    // If Mixer is directly scrolled - let the focus window scroll in real time with it
    if (!this.smoothTransition)
      boxStyle.transition = 'none'

    return (
      <div className="mixer-window-focus">
        <div className="mixer-window-focus-grid">
          <div className="mixer-window-focus-box" style={boxStyle}>
            <div className="mixer-window-focus-ring">
            </div>
          </div>
        </div>
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    // Debounced Props
    var debouncedProps = [
      'focusedTrack',
      'focusBarMin',
      'focusBarMax'
    ]
    var changeToDebounce = debouncedProps.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    if (changeToDebounce) {
      this.debouncedUpdate()
      this.smoothTransition = true
      return false
    }

    // Regular Props
    var propsToCheck = [
      'tracks',
      'xMin',
      'xMax',
      'yMin',
      'yMax'
    ]
    var changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    if (changeDetected)
      this.smoothTransition = false
    return changeDetected    
  }

  debouncedUpdate() {
    this.forceUpdate()
  }

  constructor() {
    super(...arguments)
    this.debouncedUpdate = _.debounce(this.debouncedUpdate, 64)
  }
}

MixerWindowFocus.propTypes = {
  tracks:       React.PropTypes.array.isRequired,
  focusedTrack: React.PropTypes.number,
  focusBarMin:  React.PropTypes.number.isRequired,
  focusBarMax:  React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}  
