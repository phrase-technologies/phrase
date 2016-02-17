import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js'
import { pianorollScrollX,
         pianorollMoveCursor } from '../actions/actionsPianoroll.js'
import { phraseCreateClip,
         phraseSelectClip,
         phraseDeleteClip,
         phraseDragClipSelection,
         phraseDropClipSelection } from '../actions/actionsPhrase.js';
import { cursorResizeLeft,
         cursorResizeRight,
         cursorResizeLoop,
         cursorResizeRightClip,
         cursorResizeRightLoop,
         cursorResizeRightClipped,
         cursorResizeRightLooped,
         cursorClear } from '../actions/actionsCursor.js';         

const SELECT_EMPTY_AREA = "SELECT_EMPTY_AREA"
const CLICK_EMPTY_AREA  = "CLICK_EMPTY_AREA"
const SELECT_CLIP       = "SELECT_CLIP"
const CLICK_CLIP        = "CLICK_CLIP"
const DRAG_CLIP         = "DRAG_CLIP"
const DOUBLECLICK_DELAY = 360

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
    // Setup Grid System
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
    this.props.grid.didMount()

    // Event Sources
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
    // Ensure clicks from the scrollbars don't interfere
    if (e.target !== this.container)
      return

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
      this.emptyAreaEvent(e, bar)
    }
  }

  clipEvent(e, bar, foundClip) {
    // Second Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_CLIP) {
      // Double click - Delete Clip
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch( phraseDeleteClip(foundClip.id) )
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      } else {
        this.lastEvent = null
      }
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      this.lastEvent = {
        action: SELECT_CLIP,
        clipID: foundClip.id,
        bar: bar,
        looped: (foundClip.loopLength != foundClip.end - foundClip.start),
        time: Date.now()
      }
      var clipLength = foundClip.end - foundClip.start
      var loopHandle = foundClip.start + foundClip.offset
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*clipLength
      )

      if (!foundClip.selected) {
        this.props.dispatch( phraseSelectClip(foundClip.id, e.shiftKey) )
      }

      // Adjust Start Point
      if (bar < foundClip.start + threshold) {
        this.props.dispatch( cursorResizeLeft("explicit") )
        this.lastEvent.grip = "MIN"
      // Adjust End Point
      } else if (bar > foundClip.end - threshold) {
        // Already Looped Clip
        if (this.lastEvent.looped) {
          this.props.dispatch( cursorResizeRight("explicit") )
        // Possibly Looped Clip Depending on Cursor Position
        } else {
          var top = e.clientY - this.container.getBoundingClientRect().top
          // Not Looped
          if (top <= 37.5) {
            this.props.dispatch( cursorResizeRightClipped("explicit") )
            this.lastEvent.looped = false
          // Looped
          } else {
            this.props.dispatch( cursorResizeRightLooped("explicit") )
            this.lastEvent.looped = true
          }
        }
        this.lastEvent.grip = "MAX"
      // Move Entire Clip
      } else {
        this.props.dispatch( cursorClear("explicit") )
        this.lastEvent.grip = "MID"
      }
    }
  }

  emptyAreaEvent(e, bar) {
    // Second Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_EMPTY_AREA) {
      // Double click - Create Clip
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch( phraseCreateClip(this.props.currentTrack.id, bar) )
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      } else {
        this.lastEvent = null
      }
    }

    // First Click
    if (!this.lastEvent) {
      this.lastEvent = {
        action: SELECT_EMPTY_AREA,
        bar: bar,
        time: Date.now()
      }
      return
    }
  }

  mouseMoveEvent(e) {
    var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;

    // Drag Selected Clip(s)?
    if (this.lastEvent &&
       (this.lastEvent.action == SELECT_CLIP ||
        this.lastEvent.action == DRAG_CLIP)) {
      // Adjust Clip
      let offsetBar = bar - this.lastEvent.bar
      switch (this.lastEvent.grip) {
        case 'MIN': var offsetStart = offsetBar; var offsetEnd =         0; break;
        case 'MID': var offsetStart = offsetBar; var offsetEnd = offsetBar; break;
        case 'MAX': var offsetStart =         0; var offsetEnd = offsetBar; break;
      }
      this.props.dispatch( phraseDragClipSelection(this.lastEvent.clipID, offsetStart, offsetEnd, this.lastEvent.looped, 0, !e.altKey) )
      this.lastEvent.action = DRAG_CLIP
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar)
  }

  hoverEvent(e, bar) {
    if (e.target !== this.container)
      return

    var foundClip = this.props.clips.find(clip => clip.start <= bar && clip.end > bar)
    if (foundClip) {
      var clipLength = foundClip.end - foundClip.start
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*clipLength
      )

      if (bar < foundClip.start + threshold) {
        this.props.dispatch( cursorResizeLeft("implicit") )
      } else if (bar > foundClip.end - threshold) {
        if (foundClip.loopLength != foundClip.end - foundClip.start)
          this.props.dispatch( cursorResizeRight("implicit") )
        else {
          var top = e.clientY - this.container.getBoundingClientRect().top
          top <= 37.5
            ? this.props.dispatch( cursorResizeRightClip("implicit") )
            : this.props.dispatch( cursorResizeRightLoop("implicit") )
        }
      } else {
        this.props.dispatch( cursorClear("implicit") )
      }
    // Clear cursor if not hovering over a note (but only for the current canvas)
    } else {
      this.props.dispatch( cursorClear("implicit") )
    }    
  }

  mouseUpEvent(e) {
    // First Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action == SELECT_EMPTY_AREA) {
      // Prepare for possibility of second click
      this.props.dispatch( phraseSelectClip(null, false) )
      this.lastEvent.action = CLICK_EMPTY_AREA
      return
    }

    // First Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action == SELECT_CLIP) {
      // Cancel Cursor
      this.props.dispatch( cursorClear("explicit") )

      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_CLIP
      return
    }

    // Selected Clip(s) Dragged
    if (this.lastEvent &&
        this.lastEvent.action == DRAG_CLIP) {
      this.props.dispatch( phraseDropClipSelection() )
      this.lastEvent = null
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null
  }
}

PianorollTimelineControl.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  currentTrack: React.PropTypes.object,
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
