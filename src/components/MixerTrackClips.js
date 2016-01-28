// ============================================================================
// Mixer Track Clips
// ============================================================================
// This Component renders the clips in a track. This component takes
// care of multiple selection of clips. Each clip is a separate child component,
// with it's own handlers for dragging and resizing (see MixerTrackClip.js).

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { mixerSelectionStart,
         mixerSelectionEnd } from '../actions/actionsMixer.js'
import { phraseCreateClip } from '../actions/actionsPhrase.js'
import { mapClipsToTrack } from '../selectors/selectorTrack.js'

import MixerTrackClip from './MixerTrackClip.js'

export class MixerTrackClips extends Component {

  constructor() {
    super()

    this.isDragging = false
    this.lastClickTimestamp = 0

    this.handleGrip = this.handleGrip.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
  }

  render() {
    return (
      <div className="mixer-track-clips">
        {this.props.clips.map(function(clip){

          let id     = clip.id
          let left   = clip.start / this.props.barCount * 100
          let right  = clip.end   / this.props.barCount * 100
          let width  = right - left
          let trackID  = this.props.track.id
          let selected = clip.selected
          let dispatch = this.props.dispatch
          let props  = {id, left, width, trackID, selected, dispatch}

          return (<MixerTrackClip key={clip.id} {...props} />)

        }.bind(this))}
      </div>
    )
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this)
    document.addEventListener("mousemove", this.handleDrag)
    document.addEventListener("mouseup",   this.handleDrop)
    this.container.addEventListener("mousedown", this.handleGrip)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleDrag)
    document.removeEventListener("mouseup",   this.handleDrop)
    this.container.removeEventListener("mousedown", this.handleGrip)
  }

  shouldComponentUpdate(nextProps) {
    return this.props.clips !== nextProps.clips || this.props.barCount !==  nextProps.barCount
  }

  handleGrip(e) {
    if (e.target !== this.container)
      return

    var x = this.getPercentX(e)
    var y = this.getPercentY(e)

    // Doubleclick - Create Note
    if (Date.now() - this.lastClickTimestamp < 640 && this.lastClickX == x && this.lastClickY == y) {
      let bar = this.getPercentX(e) * this.props.barCount
      let key = Math.ceil(this.props.keyCount - this.getPercentY(e)*this.props.keyCount)
      this.props.dispatch( phraseCreateClip(this.props.track.id, bar) )

    // Singleclick - Selection Box
    } else {
      this.props.dispatch( mixerSelectionStart(x,y) )

      this.isDragging = true
      this.lastClickTimestamp = Date.now()
      this.lastClickX = x
      this.lastClickY = y
    }
  }

  handleDrag(e) {
    // Ignore unrelated move events
    if( !this.isDragging )
      return

    let x = this.getPercentX(e)
    let y = this.getPercentY(e)
    this.props.dispatch( mixerSelectionEnd(x,y) )
  }

  handleDrop(e) {
    // Remove selection box
    if (this.isDragging) {
      // TODO: Batch these actions
      this.props.dispatch( mixerSelectionStart(null,null) )
      this.props.dispatch( mixerSelectionEnd(null,null) )
    }

    this.isDragging = false
  }

  getPercentX(e) {
    return (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width
  }

  getPercentY(e) {
    return (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height
  }
}

MixerTrackClips.propTypes = {
  track:        React.PropTypes.object.isRequired,
  clips:        React.PropTypes.array,
  barCount:     React.PropTypes.number.isRequired,
  dispatch:     React.PropTypes.func.isRequired
}

export default connect(mapClipsToTrack)(MixerTrackClips)
