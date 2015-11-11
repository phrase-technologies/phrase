import React, { Component } from 'react';

export default class PianoRollScroll extends Component {
  render() {
    var scrollPosition = { left: 100*this.props.min+'%', right: 100*(1-this.props.max)+'%' }
    return (
      <div className="piano-roll-scroll-gutter">
        <div className="piano-roll-scroll-bar" style={scrollPosition}>
          <div className="piano-roll-scroll-min" />
          <div className="piano-roll-scroll-max" />
        </div>
      </div>
    );
  }
}

PianoRollScroll.propTypes = {
  min: React.PropTypes.number,
  max: React.PropTypes.number
};
PianoRollScroll.defaultProps = {
  min: 0.000,
  max: 1.000
};
