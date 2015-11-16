import React, { Component } from 'react';

// This is an Abstract Class.
// Please extend it and define this.className + this.renderFrame
export default class CanvasComponent extends Component {

  // ==========================================================================
  // Canvas Initialization
  // ==========================================================================

  constructor() {
    super();
    if( this.renderFrame === undefined )
      throw new TypeError("CanvasComponent.renderFrame() can not be undefined.")
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
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();

    // Render
    this.newAnimationFrame();
  }

  componentWillUnmount() {
    this.data.canvas = null;
    this.data.container = null;
    this.data.canvasContext = null;
    this.data = null;
    window.removeEventListener('resize', this.handleResize);
  }  

  shouldComponentUpdate() {
    this.newAnimationFrame();
    return false;
  }

  newAnimationFrame() {
    cancelAnimationFrame(this.renderFrame.bind(this));
    requestAnimationFrame(this.renderFrame.bind(this));    
  }

  handleResize() {
    this.data.pixelScale = window.devicePixelRatio || 1;
    this.data.canvas.width  = this.data.width  = this.data.container.clientWidth  * this.data.pixelScale;
    this.data.canvas.height = this.data.height = this.data.container.clientHeight * this.data.pixelScale;
    cancelAnimationFrame(this.renderFrame.bind(this));
    this.newAnimationFrame();
  }

  render() {
    return (
      <div className={this.className}>
      </div>
    );
  }

  // ==========================================================================
  // Canvas/Calculation helpers
  // ==========================================================================

  // In 2D vector graphics, single-pixel stroke width must be drawn at a half-pixel position, otherwise it gets sub-pixel blurring
  closestHalfPixel(pixels){ return parseInt( 0.5 + pixels ) - 0.5; }; // parseInt is a hack for efficient rounding 

  drawLine(x1, y1, x2, y2, xyFlip, color) {
    if( color )
    {
      this.data.canvasContext.beginPath();
      this.data.canvasContext.strokeStyle = color;
    }

    if( xyFlip )
    {
      x1 = [y1, y1 = x1][0];
      x2 = [y2, y2 = x2][0];
    }
    this.data.canvasContext.moveTo( x1, y1 );
    this.data.canvasContext.lineTo( x2, y2 );

    if( color )
      this.data.canvasContext.stroke();
  };

  backgroundFill(color) {
    this.data.canvasContext.fillStyle = color;
    this.data.canvasContext.fillRect( 0, 0, this.data.width, this.data.height );
  };
}
