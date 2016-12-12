import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mapPianorollToProps } from '../selectors/selectorPianoroll'
import {
  pianorollScrollX,
  pianorollScrollY,
} from 'reducers/reducePianoroll'
import { getDarkenedColor } from 'helpers/trackHelpers'

import AudioRollEmpty from './AudioRollEmpty'
import PianorollTimelineDisplay from './PianorollTimelineDisplay'
import PianorollTimelineControl from './PianorollTimelineControl'
import PianorollWindowDisplay from './PianorollWindowDisplay'
import PianorollWindowControl from './PianorollWindowControl'
import PianorollKeyboard      from './PianorollKeyboard'
import Scrollbar              from './Scrollbar'
import TimelineCursor         from './TimelineCursor'
import TimelineSelectionBox   from './TimelineSelectionBox'
import TimelinePlayhead       from './TimelinePlayhead'
import TimelineCommentRange   from './TimelineCommentRange'

export class TrackEditor extends Component {

  render() {
    if (this.props.minimized) {
      return null
    }

    let isMidi = this.props.currentTrack && this.props.currentTrack.type !== "AUDIO"

    if (!isMidi && !this.props.clips.length) {
      return <AudioRollEmpty />
    }

    let dispatchProp = {
      dispatch: this.props.dispatch
    }
    let keyboardProps = {
      yMin: this.props.yMin,
      yMax: this.props.yMax,
      keyCount: this.props.keyCount
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
      <div className={`pianoroll ${isMidi ? '' : 'audioroll'}`}>
        { isMidi && (
          <div className="pianoroll-settings" style={settingsStyle}>
            <div className="pianoroll-sound-name">{"Grand Piano" || this.props.currentTrack.name}</div>
            <div className="pianoroll-sound-thumbnail" style={thumbnailStyle} />
            {/*
            <div className="pianoroll-sound-menu btn-group-vertical">
              <div
                className="btn btn-xs btn-bright"
                onClick={this.clickPreset} {...makeButtonUnfocusable}
              >
                <span className="fa fa-caret-left" />
                <span> Preset </span>
                <span className="fa fa-caret-right" />
              </div>
              <div
                className="btn btn-xs btn-bright"
                onClick={this.clickRack} {...makeButtonUnfocusable}
              >
                <span className="fa fa-wrench" />
                <span> Edit</span>
              </div>
            </div>
            */}
          </div>
        )}
        { isMidi && (
          <div className="pianoroll-chunk">
          </div>
        )}
        { isMidi && (
          <PianorollKeyboard {...dispatchProp} {...keyboardProps} />
        )}
        <PianorollTimelineDisplay {...dispatchProp} {...timelineProps} clips={this.props.clips} />
        <PianorollTimelineControl {...dispatchProp} {...timelineProps} clips={this.props.clips} />
        <PianorollWindowDisplay {...this.props} />
        <PianorollWindowControl {...this.props} >
          <div className="pianoroll-scrollbar-horizontal">
            <Scrollbar draggableEndpoints
              min={this.props.xMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollX(min,max))}
              max={this.props.xMax}
            />
          </div>
          { isMidi && (
            <div className="pianoroll-scrollbar-vertical">
              <Scrollbar vertical
                min={this.props.yMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollY(min,max))}
                max={this.props.yMax}
              />
            </div>
          )}
        </PianorollWindowControl>
        <TimelineCommentRange {...commentRangeProps} />
        <TimelineSelectionBox {...selectionBoxProps} />
        <TimelineCursor cursor={this.props.cursor} />
        <TimelinePlayhead {...playheadProps} />
      </div>
    )
  }

  clickPreset() {
    console.log("TODO: Open Preset Chooser")
  }

  clickRack() {
    console.log("TODO: Open Rack View")
  }

}

TrackEditor.propTypes = {
  currentTrack: React.PropTypes.object,
  clips:    React.PropTypes.array,
  notes:    React.PropTypes.array,
  cursor:   React.PropTypes.number,
  playhead: React.PropTypes.number,
  xMin:   React.PropTypes.number,
  xMax:   React.PropTypes.number,
  yMin:   React.PropTypes.number,
  yMax:   React.PropTypes.number,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number,
  maximize: React.PropTypes.func.isRequired,
}
TrackEditor.defaultProps = {
  keyCount: 88
}

export default connect(mapPianorollToProps)(TrackEditor)
