import React, { Component } from 'react';

import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

export class MixerTrackMeter extends Component {

  render() {
    return (
      <div className="mixer-track-meter" />
    )
  }
}

MixerTrackMeter.propTypes = {
  ENGINE: engineShape.isRequired,
  track:  React.PropTypes.object.isRequired
}

export default connectEngine( MixerTrackMeter )