// ============================================================================
// Piano Roll Clips
// ============================================================================
// This Component renders the clips in the piano roll. Each clip has it's own
// event handling.

import React, { Component } from 'react';

// import { pianorollSelectionStart,
//          pianorollSelectionEnd,
//          pianorollCreateNote } from '../actions/actionsPianoroll.js';

import PianorollClip from './PianorollClip';

export default class PianorollClips extends Component {

  render() {
    return (
      <div className="pianoroll-clips">
        {this.props.clips.map(function(clip){

          let id     = clip.id;
          let left   = clip.start / this.props.barCount * 100;
          let right  = clip.end   / this.props.barCount * 100;
          let width  = right - left;
          let dispatch = this.props.dispatch
          let props  = {id, left, width, dispatch};

          return (<PianorollClip key={clip.id} {...props} />);

        }.bind(this))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.clips !== this.props.clips
  }
}

PianorollClips.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array
};
