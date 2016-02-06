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
    document.addEventListener("mousemove", this.mouseMoveEvent)
    document.addEventListener("mouseup",   this.mouseUpEvent)
    this.container.addEventListener("mousedown", this.mouseDownEvent)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.mouseMoveEvent)
    document.removeEventListener("mouseup",   this.mouseUpEvent)
    this.container.removeEventListener("mousedown", this.mouseDownEvent)
  }

  mouseDownEvent(e) {
    switch(e.which) {
      default:
      case 1: 
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break
    }
  }

  mouseMoveEvent(e) {
  }

  mouseUpEvent(e) {
  }

  leftClickEvent(e) {
    var top = e.clientY - this.container.getBoundingClientRect().top
    if (top >= 25) {
      var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
      var foundClip = this.props.clips.find(clip => {
        return (
          clip.start <= bar &&
          clip.end > bar
        )
      })
      if (foundClip) {
        this.clipEvent(e, foundClip)
      }
    }

    this.emptyAreaEvent(e)
  }

  emptyAreaEvent(e) {

  }

  clipEvent(e, foundClip) {
    this.selectClipEvent(e, foundClip)
  }

  selectClipEvent(e, foundClip) {
    this.props.dispatch( phraseSelectClip(foundClip.id, e.shiftKey) )
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
