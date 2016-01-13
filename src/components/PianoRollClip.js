import React, { Component } from 'react';

export default class PianoRollClip extends Component {
  render() {
    let clipStyle = {
      left: this.props.left+'%',
      width: this.props.width+'%'
    };

    return (
      <div className="piano-roll-clip" style={clipStyle}>
        <div className="piano-roll-clip-label"/>
      </div>
    );
  }
}

PianoRollClip.propTypes = {
  id:       React.PropTypes.number.isRequired,
  left:     React.PropTypes.number.isRequired,
  width:    React.PropTypes.number.isRequired,
  dispatch: React.PropTypes.func.isRequired
};
