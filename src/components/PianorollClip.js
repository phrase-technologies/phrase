import React, { Component } from 'react';

export default class PianorollClip extends Component {
  render() {
    let clipStyle = {
      left: this.props.left+'%',
      width: this.props.width+'%'
    };

    return (
      <div className="pianoroll-clip" style={clipStyle}>
        <div className="pianoroll-clip-label"/>
      </div>
    );
  }
}

PianorollClip.propTypes = {
  id:       React.PropTypes.number.isRequired,
  left:     React.PropTypes.number.isRequired,
  width:    React.PropTypes.number.isRequired,
  dispatch: React.PropTypes.func.isRequired
};
