// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import {
  mixerScrollX,
  mixerScrollY,
  mixerResizeWidth,
  mixerResizeHeight,
  mixerMoveCursor,
} from 'reducers/reduceMixer'

import {
  getTrackHeight,
  getTracksHeight
} from 'helpers/trackHelpers'

import {
  phraseCreateClip,
  phraseSelectClip,
  phraseDragClipSelection,
  phraseDropClipSelection,
  phraseSliceClip,
} from 'reducers/reducePhrase'

import { phrase } from 'actions/actions'
import { transportMovePlayhead } from 'reducers/reduceTransport'
import { pianorollSetFocusWindow } from 'reducers/reducePianoroll'

import {
  cursorChange,
  cursorResizeLeft,
  cursorResizeRight,
  cursorResizeRightClip,
  cursorResizeRightLoop,
  cursorResizeRightClipped,
  cursorResizeRightLooped,
  cursorClear
 } from 'actions/actionsCursor'

const SELECT_EMPTY_AREA = 'SELECT_EMPTY_AREA'
const CLICK_EMPTY_AREA  = 'CLICK_EMPTY_AREA'
const SELECT_CLIP       = 'SELECT_CLIP'
const CLICK_CLIP        = 'CLICK_CLIP'
const DRAG_CLIP         = 'DRAG_CLIP'
// const SELECTION_BOX     = 'SELECTION_BOX'
const DOUBLECLICK_DELAY = 360

export class MixerWindowControl extends Component {

  render() {
    return (
      <div className="mixer-window-control">
        {this.props.children}
      </div>
    )
  }

  constructor() {
    super()
    this.handleResize = this.handleResize.bind(this)
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
  }

  componentDidMount() {
    // Setup Grid System
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 11
    this.props.grid.didMount()

    // Event Sources
    this.container = ReactDOM.findDOMNode(this)
    this.container.addEventListener('mousedown', this.mouseDownEvent)
    document.addEventListener('mousemove', this.mouseMoveEvent)
    document.addEventListener('mouseup',   this.mouseUpEvent)
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    this.container.removeEventListener('mousedown', this.mouseDownEvent)
    document.removeEventListener('mousemove', this.mouseMoveEvent)
    document.removeEventListener('mouseup',   this.mouseUpEvent)
    window.removeEventListener('resize', this.handleResize)
  }

  mouseDownEvent(e) {
    // Ensure clicks from the scrollbars don't interfere
    if (e.target !== this.container)
      return

    switch(e.which) {
      default:
      case 1:
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break // TODO: handle right click
    }
  }

  leftClickEvent(e) {
    let mouseXByRange = this.props.grid.getMouseXPercent(e) * this.props.grid.getBarRange()
    let bar = (this.props.xMin + mouseXByRange) * this.props.barCount
    let trackID = this.getTrackFromCursor(e)

    let foundClip = _.findLast(this.props.clips, clip =>
      clip.trackID === trackID && clip.start <= bar && clip.end > bar
    )

    if (foundClip) {
      this.clipEvent({ e, bar, trackID, foundClip })
    } else {
      this.emptyAreaEvent(e, bar, trackID)
    }
  }

  clipEvent({ e, bar, trackID, foundClip }) {

    let { arrangeTool, dispatch } = this.props

    // Second Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action === CLICK_CLIP) {
      // Double click - zoom the focus around this clip!
      if (arrangeTool === `pointer` && Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch(pianorollSetFocusWindow(this.lastEvent.clipID, true))
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      }
      this.lastEvent = null
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      switch (arrangeTool) {
        case 'pointer':
          this.lastEvent = {
            action: SELECT_CLIP,
            clipID: foundClip.id,
            bar,
            looped: foundClip.loopLength !== foundClip.end - foundClip.start,
            trackPosition: this.props.tracks.findIndex(track => track.id === trackID),
            time: Date.now()
          }

          let clipLength = foundClip.end - foundClip.start

          let threshold = Math.min(
            8 * this.props.grid.pixelScale / this.props.grid.width * this.props.grid.getBarRange() * this.props.barCount,
            0.25 * clipLength
          )

          if (!foundClip.selected) {
            this.props.dispatch(phraseSelectClip({ clipID: foundClip.id, union: e.shiftKey }))
          }

          // Adjust Start Point
          if (bar < foundClip.start + threshold) {
            this.props.dispatch(cursorResizeLeft('explicit'))
            this.lastEvent.grip = 'MIN'
          // Adjust End Point
          } else if (bar > foundClip.end - threshold) {
            // Already Looped Clip
            if (this.lastEvent.looped) {
              this.props.dispatch(cursorResizeRight('explicit'))
            // Possibly Looped Clip Depending on Cursor Position
            } else {
              // Not Looped
              if (this.isCursorAtTrackTopHalf(e, trackID)) {
                this.props.dispatch(cursorResizeRightClipped('explicit'))
                this.lastEvent.looped = false
              // Looped
              } else {
                this.props.dispatch(cursorResizeRightLooped('explicit'))
                this.lastEvent.looped = true
              }
            }
            this.lastEvent.grip = 'MAX'
          // Move Entire Clip
          } else {
            this.props.dispatch(cursorClear('explicit'))
            this.lastEvent.grip = 'MID'
          }
          break

        case 'scissors':
          dispatch(phraseSliceClip({ bar, trackID, foundClip }))
          break

        case 'eraser':
          dispatch({ type: phrase.DELETE_CLIP, clipID: foundClip.id })
          break

        default:
          return
      }
    }
  }

  emptyAreaEvent(e, bar, trackID) {
    // Second Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action === CLICK_EMPTY_AREA) {
      // Double click - Create Clip
      if (this.props.arrangeTool === `pointer` && Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY && trackID !== null) {
        this.props.dispatch(phraseCreateClip({ trackID, start: bar }))
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      }
      this.lastEvent = null
    }

    // First Click
    if (!this.lastEvent) {
      this.lastEvent = {
        action: SELECT_EMPTY_AREA,
        bar,
        trackPosition: this.props.tracks.findIndex(track => track.id === trackID),
        time: Date.now()
      }

      if (this.props.arrangeTool === `pencil`) {
        this.props.dispatch(phraseCreateClip({ trackID, start: bar }))
      } else {
        this.props.dispatch(transportMovePlayhead(bar, !e.metaKey))
      }

      return
    }
  }

  mouseMoveEvent(e) {

    let mouseXByRange = this.props.grid.getMouseXPercent(e) * this.props.grid.getBarRange()
    let bar = (this.props.xMin + mouseXByRange) * this.props.barCount
    let trackID = this.getTrackFromCursor(e, true)       // Strict = true:  treat the gaps between each track as NOT considered a track
    let trackIDFluid = this.getTrackFromCursor(e, false) // Strict = false: treat the gaps between each track as actual tracks to facilitate smooth drag and drop

    // Drag Selected Clip(s)?
    if (this.lastEvent &&
       (this.lastEvent.action === SELECT_CLIP ||
        this.lastEvent.action === DRAG_CLIP)) {
      // Adjust Clip
      let trackPosition = this.props.tracks.findIndex(track => track.id === trackIDFluid)
      let offsetStart, offsetEnd, offsetTrack
      let offsetBar = bar - this.lastEvent.bar
      switch (this.lastEvent.grip) {
        case 'MIN': offsetStart = offsetBar; offsetEnd =         0; offsetTrack = null; break
        case 'MID': offsetStart = offsetBar; offsetEnd = offsetBar; offsetTrack = trackPosition - this.lastEvent.trackPosition; break
        case 'MAX': offsetStart =         0; offsetEnd = offsetBar; offsetTrack = null; break
      }
      this.props.dispatch(phraseDragClipSelection({
        grippedClipID: this.lastEvent.clipID,
        offsetStart,
        offsetEnd,
        offsetLooped: this.lastEvent.looped,
        offsetTrack,
        offsetSnap: !e.metaKey,
        offsetCopy: e.altKey,
      }))
      this.lastEvent.action = DRAG_CLIP
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar, trackID)
  }

  hoverEvent(e, bar, trackID) {
    let { clips, grid, barCount, arrangeTool, dispatch } = this.props

    if (e.target !== this.container)
      return

    let foundClip = clips.find(clip =>
      clip.trackID === trackID && clip.start <= bar && clip.end > bar
    )

    if (foundClip) {
      let clipLength = foundClip.end - foundClip.start

      let threshold = Math.min(
        8 * grid.pixelScale / grid.width * grid.getBarRange() * barCount,
        0.25 * clipLength
      )

      if (arrangeTool !== "pointer") {
        dispatch(cursorChange({ icon: arrangeTool, priority: `implicit` }))
      } else if (bar < foundClip.start + threshold) {
        dispatch(cursorResizeLeft('implicit'))
      } else if (bar > foundClip.end - threshold) {
        if (foundClip.loopLength !== foundClip.end - foundClip.start)
          dispatch(cursorResizeRight('implicit'))
        else
          this.isCursorAtTrackTopHalf(e, trackID)
            ? dispatch(cursorResizeRightClip('implicit'))
            : dispatch(cursorResizeRightLoop('implicit'))
      } else {
        dispatch(cursorClear('implicit'))
      }
    // Clear cursor if not hovering over a note (but only for the current canvas)
    } else {
      if (arrangeTool === `pencil`) {
        dispatch(cursorChange({ icon: arrangeTool, priority: `implicit` }))
      }
      else dispatch(cursorClear('implicit'))
    }
  }

  mouseUpEvent(e) {
    // First Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_EMPTY_AREA) {
      // Prepare for possibility of second click
      this.props.dispatch(phraseSelectClip({ clipID: null, union: false }))
      this.lastEvent.action = CLICK_EMPTY_AREA
      return
    }

    // First Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_CLIP) {
      // Focus Clip Editor to this Clip, Cancel Cursor
      this.props.dispatch(pianorollSetFocusWindow(this.lastEvent.clipID, false))
      this.props.dispatch(cursorClear('explicit'))

      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_CLIP
      return
    }

    // Selected Clip(s) Dragged - Now Drop the Clip
    if (this.lastEvent &&
        this.lastEvent.action === DRAG_CLIP) {
      this.props.dispatch(phraseDropClipSelection())
      this.lastEvent = null
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null
  }

  getTrackFromCursor(e, strict = true) {
    let contentHeight = getTracksHeight(this.props.tracks)
    let previousEdge = 0 - contentHeight * this.props.yMin
    let cursorPosition = e.clientY - this.container.getBoundingClientRect().top
    let padding = strict ? 4 : 0 // Do we treat the gaps between tracks as tracks or "null-space"? See below...

    // Each track could have different heights - iterate to the one that is interacted with (if at all)
    let foundTrack = this.props.tracks.find(track => {
      let trackHeight = getTrackHeight(track)
      let nextEdge = previousEdge + trackHeight

      if (cursorPosition >= previousEdge + padding && cursorPosition < nextEdge - padding) {
        return true
      }
      previousEdge = nextEdge
      return false
    })

    if (foundTrack) {
      return foundTrack.id
    } else if (strict) {    // Strict = true:  treat the gaps between each track as NOT considered a track
      return null
    } else if (!strict) {   // Strict = false: treat the gaps between each track as actual tracks to facilitate smooth drag and drop
      if (cursorPosition < 0) {
        return (this.props.tracks[0] || {}).id
      }
      return (this.props.tracks[this.props.tracks.length - 1] || {}).id
    }
  }

  isCursorAtTrackTopHalf(e, currentTrackID) {
    let contentHeight = getTracksHeight(this.props.tracks)
    let previousEdge = 0 - contentHeight * this.props.yMin
    let nextEdge
    let cursorPosition = e.clientY - this.container.getBoundingClientRect().top

    // Identify top and bottom edges corresponding to the current track
    this.props.tracks.find(track => {
      let trackHeight = getTrackHeight(track)
      nextEdge = previousEdge + trackHeight

      if (cursorPosition >= previousEdge && cursorPosition < nextEdge) {
        return true
      }
      previousEdge = nextEdge
      return false
    })

    // Compare cursor to the midpoint
    let midPoint = 0.5 * (previousEdge + nextEdge)
    return cursorPosition <= midPoint
  }

  handleResize() {
    this.props.dispatch(mixerResizeWidth(this.props.grid.width  / this.props.grid.pixelScale - this.props.grid.marginLeft))
    this.props.dispatch(mixerResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop))
  }

  shouldComponentUpdate(nextProps) {
    let propsToCheck = [
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
    let changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] !== this.props[prop]
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

export default
connect(state => ({ arrangeTool: state.arrangeTool }))(
  provideGridSystem(
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
)
