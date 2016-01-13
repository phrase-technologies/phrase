// ============================================================================
// Piano Roll Clips
// ============================================================================
// This Component renders the clips in the piano roll. Each clip has it's own
// event handling.

import React, { Component } from 'react';

// import { pianoRollSelectionStart,
//          pianoRollSelectionEnd,
//          pianoRollNewNote } from '../actions/actions.js';

import PianoRollClip from './PianoRollClip';

export default class PianoRollClips extends Component {

  render() {
    return (
      <div className="piano-roll-clips">
        {this.props.clips.map(function(clip){

          let id     = clip.id;
          let left   = clip.start / this.props.barCount * 100;
          let right  = clip.end   / this.props.barCount * 100;
          let width  = right - left;
          let dispatch = this.props.dispatch
          let props  = {id, left, width, dispatch};

          return (<PianoRollClip key={clip.id} {...props} />);

        }.bind(this))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.clips !== this.props.clips
  }
}

PianoRollClips.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array
};
