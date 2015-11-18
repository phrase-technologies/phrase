import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shiftInterval } from '../helpers/helpers.js';

export default class Scrollbar extends Component {

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

    // Gutter paging
    this.gutter.getDOMNode().addEventListener("mousedown", this.paging.bind(this))
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
      case React.findDOMNode(this.min):
      {
        var newMin = Math.max( this.data.startMin + percentDelta, 0.0 );
        this.props.setScroll(newMin, null);
        break;
      }
      // Middle of the Bar
      case React.findDOMNode(this.bar):
      {
        var [newMin, newMax] = shiftInterval([this.data.startMin, this.data.startMax], percentDelta);
        this.props.setScroll(newMin, newMax);
        break;
      }
      // MAX-end of the Bar
      case React.findDOMNode(this.max):
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
    this.forceUpdate();
  }

  paging(e) {
    var clickPosition = (e.clientX - this.gutter.getDOMNode().getBoundingClientRect().left) / this.data.length;
    
    // Page DOWN
    if( clickPosition < this.props.min )
      var [newMin, newMax] = shiftInterval([this.props.min, this.props.max], this.props.min - this.props.max);
    // Page UP
    else if( clickPosition > this.props.max )
      var [newMin, newMax] = shiftInterval([this.props.min, this.props.max], this.props.max - this.props.min);
    // Do nothing
    else
      return;

    this.props.setScroll(newMin, newMax);
  }

  gutterClass() {
    var classes = 'scroll-gutter';
    classes += (this.data && this.data.isDragging || this.props.forceHover) ? ' hover' : '';
    return classes;
  }

  render() {
    var gutterClass = this.gutterClass();
    var scrollPosition = { left: 100*this.props.min+'%', right: 100*(1-this.props.max)+'%' };
    return (
      <div className={gutterClass}    ref={(ref) => this.gutter = ref}>
        <div className="scroll-bar"   ref={(ref) => this.bar    = ref} style={scrollPosition}>
          <div className="scroll-min" ref={(ref) => this.min    = ref} />
          <div className="scroll-max" ref={(ref) => this.max    = ref} />
        </div>
      </div>
    );
  }
}

Scrollbar.propTypes = {
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired,
  setScroll: React.PropTypes.func.isRequired,
  forceHover: React.PropTypes.bool
};
