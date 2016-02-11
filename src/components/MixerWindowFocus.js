import React, { Component } from 'react';

import _ from 'lodash'
import { getPixelsToTrack,
         getTracksHeight } from '../helpers/trackHelpers.js';

export default class MixerWindowFocus extends Component {
  render() {
    var {tracks, focusedTrack, focusBarMin, focusBarMax, xMin, xMax, yMin, yMax} = this.props
    var left  = (focusBarMin - xMin)/(xMax - xMin)
    var right = (xMax - focusBarMax)/(xMax - xMin)
    var width = 1 - right - left
    var pixelsToFocusedTrack = 4 + getPixelsToTrack(tracks, focusedTrack)
    var contentHeight = getTracksHeight(tracks)
    var top = pixelsToFocusedTrack - contentHeight*yMin
    var boxStyle = {
      transform: 'translate3d('+left/width*100+'%,'+top+'px,1px)',
      transformOrigin: '0 0 0',
      width: width*100 + '%',
      height: 46
    }
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
      'focusBarMin',
      'focusBarMax'
    ]
    var changeToDebounce = debouncedProps.some(prop => {
      return nextProps[prop] != this.props[prop]
    })
    if (changeToDebounce) {
      this.debouncedUpdate()
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
  focusedTrack: React.PropTypes.number.isRequired,
  focusBarMin:  React.PropTypes.number.isRequired,
  focusBarMax:  React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
};  