import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
import { pianorollScrollX,
         pianorollMoveCursor } from '../actions/actionsPianoroll.js'
import { phraseSelectClip } from '../actions/actionsPhrase.js';

export class PianorollTimelineControl extends Component {

  render() {
    return (
      <div className="pianoroll-timeline-control">
        {this.props.children}
      </div>
    );
  }

  constructor() {
    super(...arguments)
    this.lastEvent = null
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
  }

  componentDidMount() {
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10

    this.container = ReactDOM.findDOMNode(this);
    this.container.addEventListener("mousedown", this.mouseDownEvent)
    document.addEventListener("mousemove", this.mouseMoveEvent)
    document.addEventListener("mouseup",   this.mouseUpEvent)
  }

  componentWillUnmount() {
    this.container.removeEventListener("mousedown", this.mouseDownEvent)
    document.removeEventListener("mousemove", this.mouseMoveEvent)
    document.removeEventListener("mouseup",   this.mouseUpEvent)
  }

  mouseDownEvent(e) {
    switch(e.which) {
      default:
      case 1: 
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break
    }
  }

  leftClickEvent(e) {
    var top = e.clientY - this.container.getBoundingClientRect().top
    if (top >= 25) {
      var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
      var foundClip = this.props.clips.find(clip => clip.start <= bar && clip.end > bar)
    }

    if (foundClip) {
      this.clipEvent(e, bar, foundClip)
    } else {
      this.emptyAreaEvent(e)
    }
  }

  clipEvent(e, bar, foundClip) {
    this.lastEvent = {
      action: "SELECT_CLIP",
      bar: bar,
      time: Date.now()
    }

    var clipLength = foundClip.end - foundClip.start
    var threshold = Math.max(5, 0.25*clipLength)

    if (!foundClip.selected) {
      this.props.dispatch( phraseSelectClip(foundClip.id, e.shiftKey) )
    }

    if (bar < foundClip.start + threshold) {
      this.lastEvent.grip = "MIN"
    } else if (bar > foundClip.end - threshold) {
      this.lastEvent.grip = "MAX"
    } else {
      this.lastEvent.grip = "MID"
    }
  }

  emptyAreaEvent(e) {

  }

  mouseMoveEvent(e) {
  }

  mouseUpEvent(e) {
  }
}

PianorollTimelineControl.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array.isRequired
}

export default provideGridSystem(
  provideGridScroll(
    PianorollTimelineControl,
    {
      scrollXActionCreator: pianorollScrollX,
      cursorActionCreator: pianorollMoveCursor
    }
  )
)
