// ============================================================================
// Mixer
// ============================================================================
// This is the top-level Component rendering the entire mixing console. 
// It is responsible for composing all the mixer's child components together.
//
// Unfortunately, it is ALSO responsible for coordinating the scrolling and
// overflow behaviours. This is the best solution we have so far, as vertical
// scrolling within the tracks is not transferrable between clients and should
// not be stored in the application state. So for now, everything in this
// convoluted component is tightly coupled.
//
// TODO: de-spaghetti this component...

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import _ from 'lodash';
import { shiftInterval,
         zoomInterval } from '../helpers/intervalHelpers.js';
import { mixerScrollX,
         mixerScrollY } from '../actions/actionsMixer.js';

import MixerTimeline from './MixerTimeline.js';
import MixerTracks from './MixerTracks.js';
import MixerWindowDisplay from './MixerWindowDisplay.js';
import MixerWindowControl from './MixerWindowControl.js';
import TimelinePlayhead from './TimelinePlayhead.js';
import TimelineCursor from './TimelineCursor.js';
import ScrollBar from './Scrollbar.js';

export class Mixer extends Component {

  render() {
    let mixerClasses = "mixer"
        mixerClasses += (this.props.yMax > 0.99) ? " mixer-disable-shadow" : ""

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
      tracks: this.props.tracks
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
        <TimelineCursor     cursor={this.props.cursor} />
        <TimelinePlayhead playhead={this.props.playhead} {...timelineProps} />
      </div>
    );
  }

  constructor() {
    super()

    this.setVerticalScroll    = this.setVerticalScroll.bind(this)
    this.setHorizontalScroll  = this.setHorizontalScroll.bind(this)
  }

  setVerticalScroll(min, max) {
    this.props.dispatch(mixerScrollY(min,max))
  }

  setHorizontalScroll(min, max) {
    this.props.dispatch(mixerScrollX(min,max))
  }
}

function mapStateToProps(state) {
  return {
    tracks: state.phrase.tracks,
    clips: state.phrase.clips,
    barCount: state.phrase.barCount,
    xMin: state.mixer.xMin,
    xMax: state.mixer.xMax,
    yMin: state.mixer.yMin,
    yMax: state.mixer.yMax,
    playhead: state.mixer.playhead,
    cursor: state.mixer.cursor
  };
}

export default connect(mapStateToProps)(Mixer);
