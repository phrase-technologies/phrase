import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import {
  pianorollScrollX,
  pianorollScrollY,
} from '../reducers/reducePianoroll.js'
import { getDarkenedColor } from '../helpers/trackHelpers.js'

/*
import AudioRollTimelineDisplay from './AudioRollTimelineDisplay.js'
import AudioRollTimelineControl from './AudioRollTimelineControl.js'
import AudioRollWindowDisplay from './AudioRollWindowDisplay.js'
import AudioRollWindowControl from './AudioRollWindowControl.js'
*/
import Scrollbar              from './Scrollbar.js'
import TimelineCursor         from './TimelineCursor.js'
import TimelineSelectionBox   from './TimelineSelectionBox.js'
import TimelinePlayhead       from './TimelinePlayhead.js'
import TimelineCommentRange   from './TimelineCommentRange.js'

export class AudioRoll extends Component {

  render() {
    if (this.props.minimized) {
      return null
    }

    if (1) {
      return (
        <div className="audioroll-empty">
          <div className="text-center">
            <button className="btn btn-bright" onClick={this.openUploadDialog}>
              <span className="fa fa-download" />
              <span> Upload audio file</span>
            </button>
            <input type="file" ref={ref => this.uploadInput = ref} />
            <br/>
            <p>Or Drag and Drop into this box</p>
          </div>
        </div>
      )
    }

    let dispatchProp = {
      dispatch: this.props.dispatch
    }
    let timelineProps = {
      cursor: this.props.cursor,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      currentTrack: this.props.currentTrack,
      barCount: this.props.barCount
    }
    let selectionBoxProps = {
      xCount: this.props.barCount,
      yCount: this.props.keyCount,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      yMin: this.props.yMin,
      yMax: this.props.yMax,
      selectionStartX: this.props.selectionStartX,
      selectionStartY: this.props.selectionStartY,
      selectionEndX: this.props.selectionEndX,
      selectionEndY: this.props.selectionEndY
    }
    let commentRangeProps = {
      barCount: this.props.barCount,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
    }
    let playheadProps = {
      ...timelineProps,
      recording: this.props.recording,
      playhead: this.props.playhead,
      dispatch: this.props.dispatch,
      scrollXActionCreator: pianorollScrollX,
      scrollYActionCreator: pianorollScrollY,
    }

    let settingsStyle = {
      background: this.props.currentTrack.color,
      backgroundImage: `linear-gradient(to bottom, ${this.props.currentTrack.color}, ${getDarkenedColor(this.props.currentTrack.color, 0.266)})`,
    }
    let thumbnailStyle = {
      backgroundImage: `url(${require('img/piano.jpg')})`,
    }

    return (
      <div className="pianoroll">
        <div className="pianoroll-settings" style={settingsStyle}>
          <div className="pianoroll-sound-name">{"Grand Piano" || this.props.currentTrack.name}</div>
          <div className="pianoroll-sound-thumbnail" style={thumbnailStyle} />
        </div>
        <AudioRollTimelineDisplay {...dispatchProp} {...timelineProps} clips={this.props.clips} />
        <AudioRollTimelineControl {...dispatchProp} {...timelineProps} clips={this.props.clips} />
        <AudioRollWindowDisplay {...this.props} />
        <AudioRollWindowControl {...this.props} >
          <div className="pianoroll-scrollbar-horizontal">
            <Scrollbar draggableEndpoints
              min={this.props.xMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollX(min,max))}
              max={this.props.xMax}
            />
          </div>
          <div className="pianoroll-scrollbar-vertical">
            <Scrollbar vertical
              min={this.props.yMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollY(min,max))}
              max={this.props.yMax}
            />
          </div>
        </AudioRollWindowControl>
        <TimelineCommentRange {...commentRangeProps} />
        <TimelineSelectionBox {...selectionBoxProps} />
        <TimelineCursor cursor={this.props.cursor} />
        <TimelinePlayhead {...playheadProps} />
      </div>
    )
  }

  openUploadDialog = () => {
    let event = new Event('click', { bubbles: true })
    ReactDOM.findDOMNode(this.uploadInput).dispatchEvent(event)
  }

}

export default AudioRoll
