import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { phraseSelectClip,
         phraseDragClipSelection } from '../actions/actionsPhrase.js'

export default class MixerTrackClip extends Component {
  render() {
    let mixerTrackClipClasses = "mixer-track-clip-label"
        mixerTrackClipClasses += this.props.selected ? ' mixer-track-clip-selected' : ''
    let clipStyle = {
      left: this.props.left+'%',
      width: this.props.width+'%'
    }

    return (
      <div className="mixer-track-clip" style={clipStyle}>
        <div className={mixerTrackClipClasses}>
          {this.props.name || 'Clip '+this.props.id}
        </div>
      </div>
    )
  }

  constructor() {
    super()
    this.isDragging = false
    this.handleGrip = this.handleGrip.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this)
    this.parent = this.container.parentElement
    document.addEventListener("mousemove", this.handleDrag)
    document.addEventListener("mouseup",   this.handleDrop)
    this.container.addEventListener("mousedown", this.handleGrip)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleDrag)
    document.removeEventListener("mouseup",   this.handleDrop)
    this.container.removeEventListener("mousedown", this.handleGrip)
  }

  handleGrip(e) {
    if (e.target !== this.container)
      return

    this.isDragging = 1

    this.startBar   = this.getPercentX(e)
    this.startTrack = this.getPercentY(e)

    this.props.dispatch( phraseSelectClip(this.props.id, e.shiftKey) )
  }

  handleDrag(e) {
    // Ignore unrelated move events
    if( !this.isDragging )
      return

    // Minimum movement before dragging note
    if( this.isDragging > 1)
    {
      let barDelta   = this.getPercentX(e) - this.startBar
      let trackDelta = Math.round(this.getPercentY(e))
      this.props.dispatch( phraseDragClipSelection(barDelta, trackDelta) )
    }

    // Track minimum required movement
    this.isDragging++
  }

  handleDrop(e) {
    // Persist proposed note change
    if( this.isDragging > 2 )
    {
      let barDelta = this.getPercentX(e) - this.startBar
      let keyDelta = this.getPercentY(e) - this.startKey
      this.props.dispatch( phraseDragClipSelection(null, null) )
    }

    this.isDragging = false
  }

  getPercentX(e) {
    return (e.clientX - this.parent.getBoundingClientRect().left) / this.parent.getBoundingClientRect().width
  }

  getPercentY(e) {
    return (e.clientY - this.parent.getBoundingClientRect().top) / this.parent.getBoundingClientRect().height
  }

}

MixerTrackClip.propTypes = {
  id:       React.PropTypes.number.isRequired,
  trackID:  React.PropTypes.number.isRequired,
  left:     React.PropTypes.number.isRequired,
  width:    React.PropTypes.number.isRequired,
  selected: React.PropTypes.bool,
  dispatch: React.PropTypes.func.isRequired
}
