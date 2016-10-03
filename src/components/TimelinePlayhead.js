// ============================================================================
// Timeline Playhead
// ============================================================================
// This Component renders a playhead in any timeline, e.g. Mixer or Pianoroll.

import React, { Component } from 'react'

import { transportMovePlayhead } from 'reducers/reduceTransport'
import { cursorResizeX, cursorClear } from 'actions/actionsCursor'
import { isModifierOn } from 'helpers/compatibilityHelpers'

export default class TimelinePlayhead extends Component {

  render() {
    let playheadClasses = "timeline-playhead"
        playheadClasses += this.props.recording ? " recording" : ""
    let left = (this.props.playhead/this.props.barCount - this.props.xMin) / (this.props.xMax - this.props.xMin)
    let playheadStyles = {
      display: this.props.playhead === null ? 'none' : 'block',
      left: left*100 + '%'
    }

    return (
      <div className="timeline-playhead-window">
        <div className="timeline-playhead-grid" ref={ref => this.container = ref}>
          <div className="timeline-playhead-grip"
            style={playheadStyles}
            onMouseDown={this.handleMouseDown}
            onWheel={this.handleScrollWheel}
          >
            <div className={playheadClasses} />
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove)
    document.addEventListener("mouseup", this.handleMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove)
    document.removeEventListener("mouseup", this.handleMouseUp)
  }

  handleMouseDown = (e) => {
    this.dragging = true
    this.dragPlayheadStart = this.props.playhead
    this.dragCursorStart = e.clientX
    this.props.dispatch(cursorResizeX("explicit"))
  }

  handleMouseMove = (e) => {
    if (this.dragging) {
      let windowRatio = this.props.xMax - this.props.xMin
      let windowBars = this.props.barCount * windowRatio
      let offsetPixels = e.clientX - this.dragCursorStart
      let offsetBar = offsetPixels / this.container.clientWidth * windowBars
      let newPlayheadBar = this.dragPlayheadStart + offsetBar
      this.props.dispatch(transportMovePlayhead(newPlayheadBar, isModifierOn(e), this.dragging))
    }
  }

  handleMouseUp = () => {
    this.dragging = false
    this.props.dispatch(cursorClear("explicit"))
  }

  handleScrollWheel = (e) => {
    e.preventDefault()

    // Ignore CTRL or META key pressed (reserved for zoom, etc.)
    if (isModifierOn(e))
      return

    // Scroll otherwise - snap the scroll to either X or Y direction, feels too jumpy when dual XY scrolling
    else if (Math.abs(e.deltaX) >= Math.abs(e.deltaY))
      this.handleScrollX(e)
    else
      this.handleScrollY(e)
  }

  handleScrollX(e) {
    if (this.props.scrollXActionCreator) {
      this.props.dispatch(this.props.scrollXActionCreator({ delta: e.deltaX }))
    }
  }
  handleScrollY(e) {
    if (this.props.scrollYActionCreator) {
      this.props.dispatch(this.props.scrollYActionCreator({ delta: e.deltaY }))
    }
  }

}

TimelinePlayhead.propTypes = {
  barCount: React.PropTypes.number,
  xMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  playhead: React.PropTypes.number
}
