// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash';
import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js';
import { mixerScrollX,
         mixerScrollY,
         mixerResizeWidth,
         mixerResizeHeight,
         mixerMoveCursor } from '../actions/actionsMixer.js';
import { getTrackHeight,
         getTracksHeight } from '../helpers/trackHelpers.js'
import { phraseCreateClip,
         phraseSelectClip,
         phraseDeleteClip,
         phraseDragClipSelection,
         phraseDropClipSelection } from '../actions/actionsPhrase.js';
import { pianorollSetFocusWindow } from '../actions/actionsPianoroll.js';         
import { cursorResizeLeft,
         cursorResizeRight,
         cursorClear } from '../actions/actionsCursor.js';         

import CanvasComponent from './CanvasComponent';

const SELECT_EMPTY_AREA = "SELECT_EMPTY_AREA"
const CLICK_EMPTY_AREA  = "CLICK_EMPTY_AREA"
const SELECT_CLIP       = "SELECT_CLIP"
const CLICK_CLIP        = "CLICK_CLIP"
const DRAG_CLIP         = "DRAG_CLIP"
const SELECTION_BOX     = "SELECTION_BOX"
const DOUBLECLICK_DELAY = 360

export class MixerWindowControl extends Component {

  render() {
    return (
      <div className="mixer-window-control">
        {this.props.children}
      </div>
    );
  }

  constructor(){
    super(...arguments)
    this.handleResize = this.handleResize.bind(this)
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
  }

  componentDidMount() {
    // Setup Grid System
    this.props.grid.marginLeft   = 10;
    this.props.grid.marginRight  = 11;
    this.props.grid.didMount()

    // Event Sources
    this.container = ReactDOM.findDOMNode(this);
    this.container.addEventListener("mousedown", this.mouseDownEvent)
    document.addEventListener("mousemove", this.mouseMoveEvent)
    document.addEventListener("mouseup",   this.mouseUpEvent)
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    this.container.removeEventListener("mousedown", this.mouseDownEvent)
    document.removeEventListener("mousemove", this.mouseMoveEvent)
    document.removeEventListener("mouseup",   this.mouseUpEvent)
    window.removeEventListener('resize', this.handleResize);
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
    var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
    var track = this.getTrackFromCursor(e)
    var foundClip = this.props.clips.find(clip => clip.start <= bar && clip.end > bar && clip.trackID == track)

    if (foundClip) {
      this.clipEvent(e, bar, track, foundClip)
    } else {
      this.emptyAreaEvent(e, bar, track)
    }
  }

  clipEvent(e, bar, track, foundClip) {
    // Second Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_CLIP) {
      // Double click - Focus Clip to Pianoroll
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch(
          pianorollSetFocusWindow(
            track,
            foundClip.start/this.props.barCount,
            foundClip.end/this.props.barCount
          )
        )
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
        time: Date.now()
      }
      var clipLength = foundClip.end - foundClip.start
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*clipLength
      )

      if (!foundClip.selected) {
        this.props.dispatch( phraseSelectClip(foundClip.id, e.shiftKey) )
      }

      if (bar < foundClip.start + threshold) {
        this.props.dispatch( cursorResizeLeft("explicit") )
        this.lastEvent.grip = "MIN"
      } else if (bar > foundClip.end - threshold) {
        this.props.dispatch( cursorResizeRight("explicit") )
        this.lastEvent.grip = "MAX"
      } else {
        this.props.dispatch( cursorClear("explicit") )
        this.lastEvent.grip = "MID"
      }
    }
  }

  emptyAreaEvent(e, bar, track) {
    // Second Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_EMPTY_AREA) {
      // Double click - Create Clip
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch( phraseCreateClip(track, bar) )
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
    var track = this.getTrackFromCursor(e)

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
      this.props.dispatch( phraseDragClipSelection(this.lastEvent.clipID, offsetStart, offsetEnd, !e.altKey) )
      this.lastEvent.action = DRAG_CLIP
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar, track)
  }

  hoverEvent(e, bar, track) {
    if (e.target !== this.container)
      return

    var foundClip = this.props.clips.find(clip => clip.start <= bar && clip.end > bar && clip.trackID == track)
    if (foundClip) {
      var clipLength = foundClip.end - foundClip.start
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*clipLength
      )

      if (bar < foundClip.start + threshold) {
        this.props.dispatch( cursorResizeLeft("implicit") )
      } else if (bar > foundClip.end - threshold) {
        this.props.dispatch( cursorResizeRight("implicit") )
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

  getTrackFromCursor(e) {
    var contentHeight = getTracksHeight(this.props.tracks)
    var previousEdge = 0 - contentHeight * this.props.yMin
    var cursorPosition = e.clientY - this.container.getBoundingClientRect().top

    // Each track could have different heights - iterate to the one that is interacted with (if at all)
    var foundTrack = this.props.tracks.find(track => {
      var trackHeight = getTrackHeight(track)
      var nextEdge = previousEdge + trackHeight

      if (cursorPosition > previousEdge + 4 && cursorPosition < nextEdge - 4)
        return true
      else {
        previousEdge = nextEdge
        return false
      }
    })

    return foundTrack ? foundTrack.id : null
  }

  handleResize() {
    this.props.dispatch(mixerResizeWidth( this.props.grid.width  / this.props.grid.pixelScale - this.props.grid.marginLeft));
    this.props.dispatch(mixerResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop ));
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

MixerWindowControl.propTypes = {
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

export default provideGridSystem(
  provideGridScroll(
    MixerWindowControl,
    {
      scrollXActionCreator: mixerScrollX,
      scrollYActionCreator: mixerScrollY,
      cursorActionCreator: mixerMoveCursor,
      enableZoomY: false
    }
  )
)
