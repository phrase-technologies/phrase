// ============================================================================
// Canvas Child Component
// ============================================================================
// This component automatically fills it's parent container DOM element,
// updating on window.resize to fit the parent's dimensions and the
// devices' pixel ratio. It takes care of the canvas rendering lifecycle.
// and all you have to do pass it a "renderFrame" callback prop which will
// be passed an instance of CanvasRenderingContext2D() to update
// 
// See also: TimelineBase.js (great to use in conjunction with!)

import React, { Component } from 'react';

export default class CanvasComponent extends Component {

  constructor() {
    super();

    this.handleResize = this.handleResize.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
  }

  componentDidMount() {
    // Initialize DOM
    this.data = this.data || {};
    this.data.canvas = React.findDOMNode(this);
    this.data.container = React.findDOMNode(this).parentElement;
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

  shouldComponentUpdate(nextProps) {
    if (nextProps.renderFrame !== this.props.renderFrame)
      this.newAnimationFrame();
    return false;
  }

  renderFrame() {
    this.props.renderFrame( this.data.canvasContext );
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
      <canvas/>
    );
  }
}
