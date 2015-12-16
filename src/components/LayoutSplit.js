import React, { Component } from 'react';
import { connect } from 'react-redux';

import { cursorSetExplicit,
         CURSOR_TYPES } from '../actions/actions.js';

export default class LayoutSplit extends Component {

  constructor() {
    super();

    this.handleGrip   = this.handleGrip.bind(this);
    this.handleDrag   = this.handleDrag.bind(this);
    this.handleDrop   = this.handleDrop.bind(this);
  }

  componentDidMount() {
    this.data = this.data || {};
    this.data.container = React.findDOMNode(this);
    this.data.isDragging = false;

    this.data.container.addEventListener("mousedown", this.handleGrip);
    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("mouseup",   this.handleDrop);
    document.addEventListener("mousedown", this.handleDrop);
  }

  componentWillUnmount() {
    this.data.container.removeEventListener("mousedown", this.handleGrip);
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup",   this.handleDrop);
    document.removeEventListener("mousedown", this.handleDrop);

    this.data = null;
  }

  handleGrip(e) {
    // Start the drag
    this.data.isDragging = true;
    this.props.dispatch(cursorSetExplicit(CURSOR_TYPES.rowresize));
  }

  handleDrag(e) {
    // Ignore moves that aren't drag-initiated
    if( !this.data.isDragging )
      return;

    var percentDelta = (e.clientY - this.data.container.getBoundingClientRect().top) / this.data.container.clientHeight;
        percentDelta = percentDelta > 1.0 ? 1.0 : percentDelta;
        percentDelta = percentDelta < 0.0 ? 0.0 : percentDelta;

    this.props.setRatio(percentDelta);
    window.dispatchEvent(new Event('resize'));
  }

  handleDrop(e) {
    // Ignore left clicks - those are not drops
    if( e.type == "mousedown" && e.which == 1 )
      return;

    // End the drag
    this.data.isDragging = false;
    this.props.dispatch(cursorSetExplicit(CURSOR_TYPES.default));
    this.forceUpdate();
  }

  render() {
    var scrollPosition = {
      top: 100*this.props.splitRatio+'%'
    };

    return (
      <div className="layout-console-split">
        <div
          className="layout-console-split-handle"
          style={scrollPosition}
        />
      </div>
    );
  }
}

LayoutSplit.propTypes = {
  splitRatio: React.PropTypes.number.isRequired,
  setRatio:   React.PropTypes.func.isRequired
};

export default connect()(LayoutSplit);
