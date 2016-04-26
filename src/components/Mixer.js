// ============================================================================
// Mixer
// ============================================================================
// This is the top-level Component rendering the entire mixing console.
// It is responsible for composing all the mixer's child components together.

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import _ from 'lodash'
import { shiftInterval,
         zoomInterval } from '../helpers/intervalHelpers.js'
import { mixerScrollX,
         mixerScrollY,
       } from '../reducers/reduceMixer.js'
import { renderedClipsSelector,
         atleastOneTrackSoloedSelector } from '../selectors/selectorMixer.js'

import MixerTimeline from './MixerTimeline.js'
import MixerTracks from './MixerTracks.js'
import MixerWindowDisplay from './MixerWindowDisplay.js'
import MixerWindowControl from './MixerWindowControl.js'
import MixerWindowFocus from './MixerWindowFocus.js'
import TimelinePlayhead from './TimelinePlayhead.js'
import TimelineCursor from './TimelineCursor.js'
import ScrollBar from './Scrollbar.js'

export class Mixer extends Component {

  render() {
    if (this.props.minimized) {
      return (
        <h2 className="workstation-heading" onClick={this.props.maximize}>
          Arrangement
          <span className="fa fa-plus-square pull-right" />
        </h2>
      )
    }

    let mixerClasses = 'mixer'
        mixerClasses += (this.props.yMin < 0.001) ? ' mixer-disable-shadow-top'    : ''
        mixerClasses += (this.props.yMax > 0.999) ? ' mixer-disable-shadow-bottom' : ''

    let timelineProps = {
      dispatch: this.props.dispatch,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      barCount: this.props.barCount
    }

    let trackRangeProps = {
      dispatch: this.props.dispatch,
      yMin: this.props.yMin,
      yMax: this.props.yMax,
      tracks: this.props.tracks,
      atleastOneTrackSoloed: this.props.atleastOneTrackSoloed
    }

    let trackFocusProps = {
      tracks: this.props.tracks,
      focusedTrack: this.props.focusedTrack,
      focusBarMin: this.props.focusBarMin,
      focusBarMax: this.props.focusBarMax,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      yMin: this.props.yMin,
      yMax: this.props.yMax,
    }

    let contentProps = {
      tracks: this.props.tracks,
      clips: this.props.clips
    }

    return (
      <div className={mixerClasses}>
        <MixerTimeline {...timelineProps} />
        <MixerTracks {...trackRangeProps} />
        <MixerWindowDisplay {...timelineProps} {...trackRangeProps} {...contentProps} />
        <MixerWindowControl {...timelineProps} {...trackRangeProps} {...contentProps}>
          <div className="mixer-scroll-horizontal">
            <ScrollBar draggableEndpoints min={this.props.xMin} max={this.props.xMax} setScroll={this.setHorizontalScroll} />
          </div>
          <div className="mixer-scroll-vertical">
            <ScrollBar vertical min={this.props.yMin} max={this.props.yMax} setScroll={this.setVerticalScroll} />
          </div>
        </MixerWindowControl>
        <MixerWindowFocus {...trackFocusProps} />
        <TimelineCursor     cursor={this.props.cursor} />
        <TimelinePlayhead playhead={this.props.playhead} {...timelineProps} />
      </div>
    )
  }

  setVerticalScroll = (min, max) => {
    this.props.dispatch(mixerScrollY(min,max))
  }

  setHorizontalScroll = (min, max) => {
    this.props.dispatch(mixerScrollX(min,max))
  }
}

function mapStateToProps(state) {
  return {
    focusedTrack: state.pianoroll.currentTrack,
    focusBarMin: state.pianoroll.xMin,
    focusBarMax: state.pianoroll.xMax,
    tracks: state.phrase.present.tracks,
    atleastOneTrackSoloed: atleastOneTrackSoloedSelector(state),
    clips: renderedClipsSelector(state),
    barCount: state.phrase.present.barCount,
    xMin: state.mixer.xMin,
    xMax: state.mixer.xMax,
    yMin: state.mixer.yMin,
    yMax: state.mixer.yMax,
    playhead: state.transport.playhead,
    cursor: state.mixer.cursor
  }
}

Mixer.propTypes = {
  minimized: React.PropTypes.bool.isRequired,
  maximize: React.PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Mixer)
