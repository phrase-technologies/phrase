import React, { Component } from 'react';

export default class PianoRollScroll extends Component {
  render() {
    return (
      <div className="piano-roll-scroll-gutter">
        <div className="piano-roll-scroll-bar">
          <div className="piano-roll-scroll-min" />
          <div className="piano-roll-scroll-max" />
        </div>
      </div>
    );
  }
}