import React, { Component } from 'react';
import { connect } from 'react-redux';

import { shiftInterval } from '../helpers/helpers.js';
import { cursorSetExplicit,
         CURSOR_TYPES } from '../actions/actions.js';

export default class Scrollbar extends Component {

  constructor() {
    super();

    this.handleResize = this.handleResize.bind(this);
    this.handleGrip   = this.handleGrip.bind(this);
    this.handleDrag   = this.handleDrag.bind(this);
    this.handleDrop   = this.handleDrop.bind(this);
    this.handlePaging = this.handlePaging.bind(this);
  }

  componentDidMount() {
    this.data = this.data || {};
    this.data.isDragging = false;
    this.data.startX = null;

    // Dimensions
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // Scrollbar Click Handlers
    this.bar.getDOMNode().addEventListener("mousedown", this.handleGrip);
    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("mouseup",   this.handleDrop);
    document.addEventListener("mousedown", this.handleDrop);

    // Gutter paging
    this.gutter.getDOMNode().addEventListener("mousedown", this.handlePaging)
  }

  componentWillUnmount() {
    this.data = null;

    this.bar.getDOMNode().removeEventListener("mousedown", this.handleGrip);
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup",   this.handleDrop);
    document.removeEventListener("mousedown", this.handleDrop);
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.data.length = this.props.vertical
                     ? this.gutter.getDOMNode().clientHeight
                     : this.gutter.getDOMNode().clientWidth;
  }

  handleGrip(e) {
    // Start the drag
    this.data.isDragging = true;
    this.data.startTarget = e.target;
    this.data.startX = e.clientX;
    this.data.startY = e.clientY;
    this.data.startMin = this.props.min;
    this.data.startMax = this.props.max;

    // If no draggableEndpoints, treat min/max refs as bar
    var currentTarget = this.props.draggableEndpoints
                      ? this.data.startTarget
                      : React.findDOMNode(this.bar);

    switch( currentTarget )
    {
      // MIN-end of the Bar
      case React.findDOMNode(this.min):
        var cursor_type = this.props.vertical ? CURSOR_TYPES.top : CURSOR_TYPES.left;
        break;
      // Middle of the Bar
      case React.findDOMNode(this.bar):
        var cursor_type = this.props.vertical ? CURSOR_TYPES.yresize : CURSOR_TYPES.xresize;
        break;
      // MAX-end of the Bar
      case React.findDOMNode(this.max):
        var cursor_type = this.props.vertical ? CURSOR_TYPES.bottom : CURSOR_TYPES.right;
        break;
    }
    this.props.dispatch(cursorSetExplicit(cursor_type));
  }

  handleDrag(e) {
    // Ignore moves that aren't drag-initiated
    if( !this.data.isDragging )
      return;

    var pixelDelta = this.props.vertical
                   ? e.clientY - this.data.startY
                   : e.clientX - this.data.startX;    // How many pixels have we moved from start position
    var percentDelta = pixelDelta / this.data.length; // What percent have we moved from the start position

    // If no draggableEndpoints, treat min/max refs as bar
    var currentTarget = this.props.draggableEndpoints
                      ? this.data.startTarget
                      : React.findDOMNode(this.bar);

    switch( currentTarget )
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

  handleDrop(e) {
    // Ignore left clicks - those are not drops
    if( e.type == "mousedown" && e.which == 1 )
      return;

    // End the drag
    this.data.isDragging = false;
    this.forceUpdate();
    this.props.dispatch(cursorSetExplicit(CURSOR_TYPES.default));    
  }

  handlePaging(e) {
    // Ensure scrollbar wasn't clicked
    if( e.target != this.gutter.getDOMNode() )
      return false;

    var clickPosition = this.props.vertical
                      ? (e.clientY - this.gutter.getDOMNode().getBoundingClientRect().top)  / this.data.length
                      : (e.clientX - this.gutter.getDOMNode().getBoundingClientRect().left) / this.data.length;
    
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
    var classes  = 'scroll-gutter';
        classes += (this.data && this.data.isDragging || this.props.forceHover) ? ' hover' : '';
        classes += this.props.vertical ? ' scroll-vertical' : ' scroll-horizontal';
        classes += this.props.draggableEndpoints ? ' scroll-draggable-endpoints' : '';
    return classes;
  }

  render() {
    var gutterClass = this.gutterClass();
    var scrollPosition = this.props.vertical
                       ? { top:  100*this.props.min+'%', bottom: 100*(1-this.props.max)+'%' }
                       : { left: 100*this.props.min+'%', right:  100*(1-this.props.max)+'%' };
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
  vertical: React.PropTypes.bool,
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired,
  setScroll: React.PropTypes.func.isRequired,
  draggableEndpoints: React.PropTypes.bool,
  forceHover: React.PropTypes.bool
};

export default connect()(Scrollbar);
