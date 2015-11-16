import React, { Component } from 'react';
import { connect } from 'react-redux';
import shiftInterval from '../helpers/helpers.js';

export default class PianoRollScroll extends Component {

  componentDidMount() {
    this.data = this.data || {};
    this.data.isDragging = false;
    this.data.startX = null;
    this.data.length = this.gutter.getDOMNode().clientWidth;

    // Grip Handler
    this.bar.getDOMNode().addEventListener("mousedown", this.grip.bind(this));

    // Drag Handler
    document.addEventListener("mousemove", this.drag.bind(this));

    // Drop Handlers
    document.addEventListener("mouseup",   this.drop.bind(this));
    document.addEventListener("mousedown", this.drop.bind(this));
  }

  componentWillUnmount() {
    this.bar.getDOMNode().removeEventListener("mousedown", this.grip);
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("mouseup",   this.drop);
    document.removeEventListener("mousedown", this.drop);
  }

  grip(e) {
    // Start the drag
    this.data.isDragging = true;
    this.data.startTarget = e.target;
    this.data.startX = e.clientX;
    this.data.startMin = this.props.min;
    this.data.startMax = this.props.max;
  }

  drag(e) {
    // Ignore moves that aren't drag-initiated
    if( !this.data.isDragging )
      return;

    var pixelDelta = e.clientX - this.data.startX;    // How many pixels have we moved from start position
    var percentDelta = pixelDelta / this.data.length; // What percent have we moved from the start position

    switch( this.data.startTarget )
    {
      // MIN-end of the Bar
      case this.min.getDOMNode():
      {
        var newMin = Math.max( this.data.startMin + percentDelta, 0.0 );
        this.props.setScroll(newMin, null);
        break;
      }
      // Middle of the Bar
      case this.bar.getDOMNode():
      {
        var [newMin, newMax] = shiftInterval([this.data.startMin, this.data.startMax], percentDelta);
        this.props.setScroll(newMin, newMax);
        this.props.dispatch(pianoRollScrollX(newMin, newMax));
        break;
      }
      // MAX-end of the Bar
      case this.max.getDOMNode():
      {
        var newMax = Math.min( this.data.startMax + percentDelta, 1.0 );
        this.props.setScroll(null, newMax);
        break;
      }
    }
  }

  drop(e) {
    // Ignore left clicks - those are not drops
    if( e.type == "mousedown" && e.which == 1 )
      return;

    // End the drag
    this.data.isDragging = false;
  }

  render() {
    var scrollPosition = { left: 100*this.props.min+'%', right: 100*(1-this.props.max)+'%' }
    return (
      <div className="piano-roll-scroll-gutter"  ref={(ref) => this.gutter = ref}>
        <div className="piano-roll-scroll-bar"   ref={(ref) => this.bar    = ref} style={scrollPosition}>
          <div className="piano-roll-scroll-min" ref={(ref) => this.min    = ref} />
          <div className="piano-roll-scroll-max" ref={(ref) => this.max    = ref} />
        </div>
      </div>
    );
  }
}

PianoRollScroll.propTypes = {
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired,
  setScroll: React.PropTypes.func.isRequired
};

export default connect()(PianoRollScroll);
