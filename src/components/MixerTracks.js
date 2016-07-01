// ============================================================================
// Mixer Scroll Window
// ============================================================================
// This Component sits beneath the tracks in the mixer and renders vertical
// barlines and provides horizontal scrolling. The tracks themselves also
// provide horizontal scrolling but both are needed for the complete UX.

import React, { Component } from 'react'

import { getTracksHeight } from '../helpers/trackHelpers.js'
import { phraseCreateTrack } from '../reducers/reducePhrase.js'
import { mixerScrollY } from 'reducers/reduceMixer.js'

import MixerTrack from './MixerTrack.js'
import NewRibbon from './NewRibbon.js'

export default class MixerTracks extends Component {

  render() {
    let contentHeight = getTracksHeight(this.props.tracks)
    let scrollOffset = this.props.yMin * contentHeight * -1
    let emptyAreaOffset = contentHeight + scrollOffset - 54 - 2

    return (
      <div className="mixer-track-list-gutter">
        <ul className="mixer-track-list" style={{marginTop: scrollOffset}} onWheel={this.handleScroll}>
          {this.props.tracks.map(track => (
            <MixerTrack
              key={track.id}
              dispatch={this.props.dispatch}
              track={track}
              focused={track.id === this.props.currentTrack}
              atleastOneTrackSoloed={this.props.atleastOneTrackSoloed}
            />
          ))}
          <NewRibbon handleClick={this.addNewTrack} text=" Add MIDI Track" />
        </ul>
        <div className="mixer-empty-area" style={{top: emptyAreaOffset}} />
      </div>
    )
  }

  addNewTrack = () => {
    this.props.dispatch(phraseCreateTrack())
  }

  handleScroll = (e) => {
    if (e.deltaY) {
      this.props.dispatch(mixerScrollY({
        delta: e.deltaY
      }))
    }
    e.preventDefault()
  }

  shouldComponentUpdate(nextProps) {
    let propsToCheck = [
      'dispatch',
      'tracks',
      'yMin',
      'yMax'
    ]
    let changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] !== this.props[prop]
    })
    return changeDetected
  }

}

MixerTracks.propTypes = {
  atleastOneTrackSoloed: React.PropTypes.bool.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  tracks:       React.PropTypes.array.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}
