import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mapPianorollToProps } from '../selectors/selectorPianoroll.js'
import { pianorollScrollX,
         pianorollScrollY
       } from '../reducers/reducePianoroll.js'

import PianorollTimelineDisplay from './PianorollTimelineDisplay.js'
import PianorollTimelineControl from './PianorollTimelineControl.js'
import PianorollWindowDisplay from './PianorollWindowDisplay.js'
import PianorollWindowControl from './PianorollWindowControl.js'
import PianorollKeyboard      from './PianorollKeyboard.js'
import Scrollbar              from './Scrollbar.js'
import TimelineCursor         from './TimelineCursor.js'
import TimelineSelectionBox   from './TimelineSelectionBox.js'
import TimelinePlayhead       from './TimelinePlayhead.js'

export default class Pianoroll extends Component {

  render() {
    if (this.props.minimized) {
      return (
        <h2 className="workstation-heading" onClick={this.props.maximize}>
          Clip Editor
          <span className="fa fa-plus-square pull-right" />
        </h2>
      )
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

    return (
      <div className="pianoroll">
        <PianorollKeyboard {...dispatchProp} {...keyboardProps} currentTrack={this.props.currentTrack} />
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
          <div className="pianoroll-scrollbar-vertical">
            <Scrollbar vertical
              min={this.props.yMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollY(min,max))}
              max={this.props.yMax}
            />
          </div>
        </PianorollWindowControl>
        <TimelineSelectionBox {...selectionBoxProps} />
        <TimelineCursor cursor={this.props.cursor} />
        <TimelinePlayhead {...timelineProps} playhead={this.props.playhead} recording={this.props.recording} />
      </div>
    )
  }
}

Pianoroll.propTypes = {
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
Pianoroll.defaultProps = {
  keyCount: 88
}

export default connect(mapPianorollToProps)(Pianoroll)
