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

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

var canvasCounter = 0

export default class CanvasComponent extends Component {

  constructor() {
    super()

    this.canvasID = canvasCounter++
    this.handleResize = this.handleResize.bind(this)
  }

  componentDidMount() {
    // Initialize DOM
    this.data = this.data || {}
    this.data.canvas = ReactDOM.findDOMNode(this)
    this.data.container = ReactDOM.findDOMNode(this).parentElement
    this.data.canvasContext = this.data.canvas.getContext('2d')

    // Set Scaling
    this.data.pixelScale = window.devicePixelRatio || 1
    this.data.canvasContext.scale( this.data.pixelScale, this.data.pixelScale )
    window.addEventListener('resize', this.handleResize)
    this.handleResize()

    // Render
    CanvasComponent.requestCanvasUpdate(
      this.canvasID,
      () => this.props.renderFrame(this.data.canvasContext)
    )
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    CanvasComponent.cancelCanvasUpdate(this.canvasID)
  }  

  shouldComponentUpdate(nextProps) {
    if (nextProps.renderFrame !== this.props.renderFrame)
      CanvasComponent.requestCanvasUpdate(
        this.canvasID,
        () => nextProps.renderFrame(this.data.canvasContext)
      )
    return false
  }

  handleResize() {
    this.data.pixelScale = window.devicePixelRatio || 1
    this.data.canvas.width  = this.data.width  = this.data.container.clientWidth  * this.data.pixelScale
    this.data.canvas.height = this.data.height = this.data.container.clientHeight * this.data.pixelScale
    CanvasComponent.requestCanvasUpdate(
      this.canvasID,
      () => this.props.renderFrame(this.data.canvasContext)
    )
  }

  render() {
    return (
      <canvas/>
    )
  }
}

CanvasComponent.canvasUpdates = null
CanvasComponent.requestCanvasUpdate = function(canvasID, canvasUpdate) {
  // Animation frame already requested, just add/update the specific canvas update
  if (CanvasComponent.canvasUpdates) {
    CanvasComponent.canvasUpdates[canvasID] = canvasUpdate
  }
  // Request brand new animation frame
  else {
    CanvasComponent.canvasUpdates = []
    CanvasComponent.canvasUpdates[canvasID] = canvasUpdate
    requestAnimationFrame(() => {
      CanvasComponent.canvasUpdates.forEach(canvasUpdate => {
        if (typeof canvasUpdate === 'function')
          canvasUpdate()
      })
      CanvasComponent.canvasUpdates = null
    })
  }
}
CanvasComponent.cancelCanvasUpdate = function(canvasID) {
  if (CanvasComponent.canvasUpdates)
    CanvasComponent.canvasUpdates[canvasID] = null
}
