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

MixerWindow.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
