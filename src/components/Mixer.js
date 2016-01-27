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
         zoomInterval } from '../helpers/helpers.js';
import { phraseCreateTrack } from '../actions/actionsPhrase.js'
import { mixerScrollX,
         mixerScrollY } from '../actions/actionsMixer.js';

import MixerTimeline from './MixerTimeline.js';
import MixerTrack from './MixerTrack.js';
import MixerTrackNew from './MixerTrackNew.js';
import MixerScrollWindow from './MixerScrollWindow.js';
import TimelinePlayhead from './TimelinePlayhead.js';
import TimelineCursor from './TimelineCursor.js';
import ScrollBar from './Scrollbar.js';

export class Mixer extends Component {

  render() {
    var scrollOffset = this.state.scroll
                     ? this.state.scroll.min * this.data.scrollTarget.scrollHeight * -1
                     : 0;

    let timelineProps = {
      dispatch: this.props.dispatch,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      barCount: this.props.barCount
    }

    return (
      <div className={'mixer' + (this.state.scroll ? ' mixer-overflow' : '')} >
        <MixerTimeline {...timelineProps} />
        <div className="mixer-track-list-gutter">
          <ul className="mixer-track-list" ref={(ref) => this.mixerList = ref} style={{marginTop: scrollOffset}}>
            {this.props.tracks.map(function(track){ return (
              <MixerTrack key={track.id} track={track} {...timelineProps} />
            )}.bind(this))}
            <MixerTrackNew handleClickNew={this.addNewTrack} />
          </ul>
          <div className="mixer-empty-area" style={{top: this.state.emptyAreaOffset}} />
        </div>
        <MixerScrollWindow {...timelineProps}>
          <div className="mixer-settings-center">
            <div className="mixer-scroll-horizontal">
              <ScrollBar draggableEndpoints min={this.props.xMin} max={this.props.xMax} setScroll={this.setHorizontalScroll} />
            </div>
          </div>
        </MixerScrollWindow>
        {this.renderScrollbarVertical()}
        {/*
        <TimelinePlayhead playhead={this.props.playhead} />
        */}
        <TimelineCursor     cursor={this.props.cursor} />
        <div className="mixer-settings-left" />
        <div className="mixer-settings-right" />
      </div>
    );
  }

  renderScrollbarVertical() {
    if( this.state.scroll )
      return (
        <div className="mixer-scroll-vertical">
          <ScrollBar vertical
            min={this.state.scroll.min}
            max={this.state.scroll.max}
            setScroll={this.setVerticalScroll}
          />
        </div>
      );
    return null;
  }

  constructor() {
    super();
    this.state = {
      scroll: null,
      emptyAreaOffset: 0
    };

    this.addNewTrack          = this.addNewTrack.bind(this);
    this.setVerticalScroll    = this.setVerticalScroll.bind(this);
    this.setHorizontalScroll  = this.setHorizontalScroll.bind(this);
    this.handleResize         = this.handleResize.bind(this);
    this.handleScrollWheel    = this.handleScrollWheel.bind(this);
  }

  componentDidMount() {
    this.data = this.data || {};
    this.data.container = ReactDOM.findDOMNode(this);
    this.data.container.addEventListener("wheel", this.handleScrollWheel);
    this.data.scrollTarget = ReactDOM.findDOMNode(this.mixerList);
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    this.data.container.removeEventListener("wheel", this.handleScrollWheel);
    this.data.container = null;
    this.data = null;
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate() {
    // We fire resize events when new tracks are created to trigger vertical scroll adjustments
    // Use dirtyHeight flag to ensure only a single check - risk of infinite loops!
    if( this.data.dirtyHeight )
    {
      this.handleResize();
      this.data.dirtyHeight = false;
    }
  }

  handleResize() {
    // No overflow
    if( this.data.scrollTarget.clientHeight == this.data.scrollTarget.scrollHeight )
    {
      // No Scrollbar
      var newScrollState = {scroll: null, emptyAreaOffset: 0};

      // Set the empty area div to fill the remaining space!
      let nodeList = this.data.scrollTarget.childNodes;
      for( var i = 0; i < nodeList.length - 1; i++ )
        newScrollState.emptyAreaOffset += nodeList[i].offsetHeight - 2;
    }

    // Overflow - calculate optimal scroll position
    else
    {
      let newWindow = this.data.scrollTarget.clientHeight / this.data.scrollTarget.scrollHeight

      // Existing scroll position - calculate as a zoom from here
      if( this.state.scroll )
      {
        // If already scrolled to top or bottom, keep sticky
        let fulcrum;
        if( this.state.scroll.min < 0.001 ) { fulcrum = 0.000; }
        if( this.state.scroll.max > 0.999 ) { fulcrum = 1.000; }

        let oldWindow = this.state.scroll.max - this.state.scroll.min;
        let zoomFactor = newWindow/oldWindow;
        let [newMin, newMax] = zoomInterval([this.state.scroll.min, this.state.scroll.max], zoomFactor, fulcrum);
        var newScrollState = { scroll: { min: newMin, max: newMax } };
      }

      // Newly overflowed - start from 0
      else
      {
        var newScrollState = { scroll: { min: 0, max: newWindow } };
      }
    }

    // Only send actual changes - avoid triggering unnecessary renders!
    if( !_.isEqual( newScrollState, this.state ) )
      this.setState(newScrollState);
  }  

  // Scrolling and zooming within the timeline
  handleScrollWheel(e) {
    // Ignore horizontal scrolls or CTRL/CMD+scrolls (handled by MixerScrollWindow, UX is jagged if simultaneous X&Y scrolling)
    if(!this.state.scroll || e.ctrlKey || e.metaKey || (Math.abs(e.deltaX) > Math.abs(e.deltaY)) )
      return;
    var scrollWindow = this.state.scroll.max - this.state.scroll.min;
    var stepSize = e.deltaY / this.data.scrollTarget.clientHeight * scrollWindow;
    var [newMin, newMax] = shiftInterval([this.state.scroll.min, this.state.scroll.max], stepSize);
    this.setVerticalScroll(newMin, newMax);
  }

  addNewTrack() {
    this.data.dirtyHeight = true;
    this.props.dispatch(phraseCreateTrack());
  }

  setVerticalScroll(min, max) {
    this.setState({scroll: {min, max}});
  }

  setHorizontalScroll(min, max) {
    this.props.dispatch(mixerScrollX(min,max));
  }

}

Mixer.defaultProps = {
  barCount: 64
};

function mapStateToProps(state) {
  return {
    tracks: state.phrase.tracks,
    xMin: state.mixer.xMin,
    xMax: state.mixer.xMax,
    playhead: state.mixer.playhead,
    cursor: state.mixer.cursor
  };
}

export default connect(mapStateToProps)(Mixer);
