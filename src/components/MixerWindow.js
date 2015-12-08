import React, { Component } from 'react';

import _ from 'lodash';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';

import MixerTrack from './MixerTrack.js';
import MixerTrackNew from './MixerTrackNew.js';
import ScrollBar from './Scrollbar.js';

export default class MixerWindow extends Component {

  constructor() {
    super();
    this.state = {
      scroll: null,
      tracks: [1,2,3]
    };

    this.addNewTrack = this.addNewTrack.bind(this);
    this.setVerticalScroll = this.setVerticalScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleScrollWheel = this.handleScrollWheel.bind(this);
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
      var newScrollState = {scroll: null};

    // Overflow - calculate optimal scroll position
    else
    {
      let newWindow = this.data.scrollTarget.clientHeight / this.data.scrollTarget.scrollHeight

      // Existing scroll position - calculate as a zoom from here
      if( this.state.scroll )
      {
        let fulcrum;

        // If already scrolled to top or bottom, keep sticky
        if( this.state.scroll.min < 0.001 )
          fulcrum = 0.000;
        if( this.state.scroll.max > 0.999 )
          fulcrum = 1.000;

        let oldWindow = this.state.scroll.max - this.state.scroll.min;
        let zoomFactor = newWindow/oldWindow;
        let [newMin, newMax] = zoomInterval([this.state.scroll.min, this.state.scroll.max], zoomFactor, fulcrum);
        var newScrollState
        var newScrollState = {
          scroll: {
            min: newMin,
            max: newMax
          }
        };
      }

      // Newly overflowed - start from 0
      else
      {
        var newScrollState = {
          scroll: {
            min: 0,
            max: newWindow
          }
        };
      }
    }

    // Only send actual changes - avoid triggering unnecessary renders!
    if( !_.isEqual( newScrollState.scroll, this.state.scroll ) )
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
  //this.props.dispatch(pianoRollScrollX(min,max));
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

  render() {
    var mixerWindowClasses  = 'mixer-window';
        mixerWindowClasses += this.state.scroll ? ' mixer-window-overflow' : '';
    var trackComponents = this.getTracks();
    var scrollbarVertical = this.renderScrollbarVertical();
    var scrollOffset = this.state.scroll
                     ? this.state.scroll.min * this.data.scrollTarget.scrollHeight * -1
                     : 0;
    var scrollOffsetStyles = {marginTop: scrollOffset};

    return (
      <div className={mixerWindowClasses}>
        <ul className="mixer-list" ref={(ref) => this.mixerList = ref} style={scrollOffsetStyles}>
          {trackComponents}
          <MixerTrackNew handleClickNew={this.addNewTrack} />
        </ul>
        {scrollbarVertical}
      </div>
    );
  }
}

MixerWindow.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
