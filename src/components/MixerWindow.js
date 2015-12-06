import React, { Component } from 'react';
import MixerTrack from './MixerTrack.js';
import MixerTrackNew from './MixerTrackNew.js';

export default class MixerWindow extends Component {

  constructor() {
    super();
    this.state = {
      tracks: [1,2,3]
    };

    this.addNewTrack = this.addNewTrack.bind(this);
  }

  getTracks() {
    var trackComponents = [];
    this.state.tracks.forEach(function(element){
      trackComponents.push(<MixerTrack track={element} key={element} />);
    });

    return trackComponents;
  }

  addNewTrack() {
    var newTrackState = this.state.tracks.slice();
        newTrackState.push( newTrackState.length + 1 );
    this.setState({tracks: newTrackState});
  }

  render() {
    var trackComponents = this.getTracks();
    var ruler = null;

    return (
      <div className="mixer-window">
        <ul className="mixer">
          {ruler}
          {trackComponents}
          <MixerTrackNew handleClickNew={this.addNewTrack} />
        </ul>
      </div>
    );
  }
}
