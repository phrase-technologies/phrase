import React, { Component } from 'react';

import _ from 'lodash';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX } from '../actions/actions.js';

import MixerTrack from './MixerTrack.js';
import MixerTrackNew from './MixerTrackNew.js';
import MixerScrollWindow from './MixerScrollWindow.js';
import ScrollBar from './Scrollbar.js';

export default class MixerTrackList extends Component {

  render() {
    var mixerWindowClasses  = 'mixer-track-list-window';
        mixerWindowClasses += this.state.scroll ? ' mixer-track-list-overflow' : '';
    var scrollOffset = this.state.scroll
                     ? this.state.scroll.min * this.data.scrollTarget.scrollHeight * -1
                     : 0;
    var scrollOffsetStyles = {marginTop: scrollOffset};
    var emptyAreaStyle = {top: this.state.emptyAreaOffset};
    console.log( emptyAreaStyle );

    return (
      <div className={mixerWindowClasses}>
        <div className="mixer-track-list-gutter">
          <ul className="mixer-track-list" ref={(ref) => this.mixerList = ref} style={scrollOffsetStyles}>
            {this.getTracks()}
            <MixerTrackNew handleClickNew={this.addNewTrack} />
          </ul>
          <div className="mixer-empty-area" ref={(ref) => this.emptyArea = ref} style={emptyAreaStyle} />
        </div>
        <MixerScrollWindow
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          barCount={this.props.barCount}
          dispatch={this.props.dispatch}
        >
          {this.renderScrollbarHorizontal()}
        </MixerScrollWindow>
        <div className="mixer-settings-left" />
        <div className="mixer-settings-right" />
        {this.renderScrollbarVertical()}
      </div>
    );
  }

  constructor() {
    super();
    this.state = {
      scroll: null,
      tracks: [1,2,3],
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
    this.data.container = React.findDOMNode(this);
    this.data.container.addEventListener("wheel", this.handleScrollWheel);
    this.data.scrollTarget = React.findDOMNode(this.mixerList);
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
    // Treat new tracks as resize events.
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
    if(!this.state.scroll || e.ctrlKey || e.metaKey )
      return;
    var scrollWindow = this.state.scroll.max - this.state.scroll.min;
    var stepSize = e.deltaY / this.data.scrollTarget.clientHeight * scrollWindow;
    var [newMin, newMax] = shiftInterval([this.state.scroll.min, this.state.scroll.max], stepSize);
    this.setVerticalScroll(newMin, newMax);
  }

  getTracks() {
    var trackComponents = [];
    this.state.tracks.forEach(function(element){
      trackComponents.push(
        <MixerTrack
          key={element}
          track={element}
          barCount={this.props.barCount}
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          dispatch={this.props.dispatch}
        />
      );
    }.bind(this));

    return trackComponents;
  }

  addNewTrack() {
    var newTrackState = this.state.tracks.slice();
        newTrackState.push( newTrackState.length + 1 );
    this.data.dirtyHeight = true;
    this.setState({tracks: newTrackState});
  }

  setVerticalScroll(min, max) {
    this.setState({scroll: {min: min, max: max}});
  }

  setHorizontalScroll(min, max) {
    this.props.dispatch(pianoRollScrollX(min,max));
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

  renderScrollbarHorizontal() {
    return (
      <div className="mixer-scroll-horizontal">
        <ScrollBar draggableEndpoints
          min={this.props.barMin}
          max={this.props.barMax}
          setScroll={this.setHorizontalScroll}
        />
      </div>
    );
  }
}

MixerTrackList.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
