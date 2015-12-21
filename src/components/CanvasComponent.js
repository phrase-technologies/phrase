// ============================================================================
// Canvas Base Component
// ============================================================================
// This is a custom-rolled base component which you should use if you are
// building a canvas component. It takes care of the canvas rendering lifecycle.
// and All you have to do is extend it and define a renderFrame() method on the
// child.
// 
// See also: TimelineBase.js

import React, { Component } from 'react';

// This is an Abstract Class.
// Please extend it and define this.className + this.renderFrame
export default class CanvasComponent extends Component {

  // --------------------------------------------------------------------------
  // Canvas Initialization
  // --------------------------------------------------------------------------

  constructor() {
    super();
    if( this.renderFrame === undefined )
      throw new TypeError("CanvasComponent.renderFrame() is an abstract method and must be defined by a descendant.");

    this.handleResize = this.handleResize.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
  }

  componentDidMount() {
    // Initialize DOM
    this.data = this.data || {};
    this.data.canvas = document.createElement('canvas');
    this.data.container = React.findDOMNode(this);
    this.data.container.appendChild(this.data.canvas);
    this.data.canvasContext = this.data.canvas.getContext("2d");

    // Set Scaling
    this.data.pixelScale = window.devicePixelRatio || 1;
    this.data.canvasContext.scale( this.data.pixelScale, this.data.pixelScale );
    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    // Render
    this.newAnimationFrame();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    cancelAnimationFrame(this.renderFrame);
  }  

  shouldComponentUpdate() {
    this.newAnimationFrame();
    return true;
  }

  newAnimationFrame() {
    cancelAnimationFrame(this.renderFrame);
    requestAnimationFrame(this.renderFrame);    
  }

  handleResize() {
    this.data.pixelScale = window.devicePixelRatio || 1;
    this.data.canvas.width  = this.data.width  = this.data.container.clientWidth  * this.data.pixelScale;
    this.data.canvas.height = this.data.height = this.data.container.clientHeight * this.data.pixelScale;
    this.newAnimationFrame();
  }

  render() {
    return (
      <div className={this.className}>
        {this.props.children}
      </div>
    );
  }
}
