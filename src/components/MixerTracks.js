// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react';

import _ from 'lodash';
import { closestHalfPixel,
         drawLine } from '../helpers/canvasHelpers.js';
import { getTracksHeight } from '../helpers/trackHelpers.js'
import { phraseCreateTrack } from '../actions/actionsPhrase.js'

import MixerTrack from './MixerTrack.js';
import MixerTrackNew from './MixerTrackNew.js';

export default class MixerTracks extends Component {

  constructor() {
    super()
    this.addNewTrack = this.addNewTrack.bind(this);
  }

  render() {
    var contentHeight = getTracksHeight(this.props.tracks)
    var scrollOffset = this.props.yMin * contentHeight * -1
    var emptyAreaOffset = contentHeight + scrollOffset - 54 - 2

    return (
      <div className="mixer-track-list-gutter">
        <ul className="mixer-track-list" style={{marginTop: scrollOffset}}>
          {this.props.tracks.map(track => (
            <MixerTrack key={track.id} dispatch={this.props.dispatch} track={track} focused={track.id == this.props.currentTrack} />
          ))}
          <MixerTrackNew handleClickNew={this.addNewTrack} />
        </ul>
        <div className="mixer-empty-area" style={{top: emptyAreaOffset}} />
      </div>
    );
  }

  addNewTrack() {
    this.props.dispatch(phraseCreateTrack());
  }
}

MixerTracks.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  tracks:       React.PropTypes.array.isRequired,
  currentTrack: React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}

