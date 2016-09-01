import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { shiftInterval } from '../helpers/intervalHelpers.js'
import { cursorResizeX,
         cursorResizeY,
         cursorResizeLeft,
         cursorResizeRight,
         cursorResizeTop,
         cursorResizeBottom,
         cursorClear } from '../actions/actionsCursor.js'

export class Scrollbar extends Component {

  constructor() {
    super()

    this.handleResize = this.handleResize.bind(this)
    this.handleGrip   = this.handleGrip.bind(this)
    this.handleDrag   = this.handleDrag.bind(this)
    this.handleDrop   = this.handleDrop.bind(this)
    this.handlePaging = this.handlePaging.bind(this)
  }

  componentDidMount() {
    this.data = this.data || {}
    this.data.isDragging = false
    this.data.startX = null

    // Dimensions
    this.handleResize()
    window.addEventListener('resize', this.handleResize)

    // Scrollbar Click Handlers
    this.bar.addEventListener('mousedown', this.handleGrip)
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup',   this.handleDrop)
    document.addEventListener('mousedown', this.handleDrop)

    // Gutter paging
    this.gutter.addEventListener('mousedown', this.handlePaging)
  }

  componentWillUnmount() {
    this.data = null

    this.bar.removeEventListener('mousedown', this.handleGrip)
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup',   this.handleDrop)
    document.removeEventListener('mousedown', this.handleDrop)
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize() {
    this.data.length = this.props.vertical
                     ? this.gutter.clientHeight
                     : this.gutter.clientWidth
  }

  handleGrip(e) {
    // Start the drag
    this.data.isDragging = true
    this.data.startTarget = e.target
    this.data.startX = e.clientX
    this.data.startY = e.clientY
    this.data.startMin = this.props.min
    this.data.startMax = this.props.max

    // If no draggableEndpoints, treat min/max refs as bar
    let currentTarget = this.props.draggableEndpoints
                      ? this.data.startTarget
                      : ReactDOM.findDOMNode(this.bar)
    let cursorType

    switch(currentTarget)
    {
      // MIN-end of the Bar
      case ReactDOM.findDOMNode(this.min):
        cursorType = this.props.vertical ? cursorResizeTop : cursorResizeLeft
        break
      // Middle of the Bar
      case ReactDOM.findDOMNode(this.bar):
        cursorType = this.props.vertical ? cursorResizeY : cursorResizeX
        break
      // MAX-end of the Bar
      case ReactDOM.findDOMNode(this.max):
        cursorType = this.props.vertical ? cursorResizeBottom : cursorResizeRight
        break
    }
    this.props.dispatch(cursorType('explicit'))
  }

  handleDrag(e) {
    // Ignore moves that aren't drag-initiated
    if(!this.data.isDragging)
      return

    let pixelDelta = this.props.vertical
                   ? e.clientY - this.data.startY
                   : e.clientX - this.data.startX    // How many pixels have we moved from start position
    let percentDelta = pixelDelta / this.data.length // What percent have we moved from the start position

    // If no draggableEndpoints, treat min/max refs as bar
    let currentTarget = this.props.draggableEndpoints
                      ? this.data.startTarget
                      : ReactDOM.findDOMNode(this.bar)

    switch(currentTarget)
    {
      // MIN-end of the Bar
      case ReactDOM.findDOMNode(this.min):
      {
        let newMin = Math.max(this.data.startMin + percentDelta, 0.0)
        this.props.setScroll({ min: newMin })
        break
      }
      // Middle of the Bar
      case ReactDOM.findDOMNode(this.bar):
      {
        let [newMin, newMax] = shiftInterval([this.data.startMin, this.data.startMax], percentDelta)
        this.props.setScroll({ min: newMin, max: newMax })
        break
      }
      // MAX-end of the Bar
      case ReactDOM.findDOMNode(this.max):
      {
        let newMax = Math.min(this.data.startMax + percentDelta, 1.0)
        this.props.setScroll({ max: newMax })
        break
      }
    }
  }

  handleDrop(e) {
    // Ignore left clicks - those are not drops
    if (e.type === 'mousedown' && e.which === 1)
      return

    // End the drag
    this.data.isDragging = false
    this.forceUpdate()
    this.props.dispatch(cursorClear('explicit'))
  }

  handlePaging(e) {
    // Ensure scrollbar wasn't clicked
    if (e.target !== this.gutter)
      return false

    let clickPosition = this.props.vertical
                      ? (e.clientY - this.gutter.getBoundingClientRect().top)  / this.data.length
                      : (e.clientX - this.gutter.getBoundingClientRect().left) / this.data.length
    let newMin, newMax

    // Page DOWN
    if (clickPosition < this.props.min)
      [newMin, newMax] = shiftInterval([this.props.min, this.props.max], this.props.min - this.props.max)
    // Page UP
    else if (clickPosition > this.props.max)
      [newMin, newMax] = shiftInterval([this.props.min, this.props.max], this.props.max - this.props.min)
    // Do nothing
    else
      return

    this.props.setScroll({ min: newMin, max: newMax })
  }

  gutterClass() {
    let classes  = 'scrollbar-gutter'
        classes += (this.data && this.data.isDragging || this.props.forceHover) ? ' hover' : ''
        classes += this.props.vertical ? ' scrollbar-vertical' : ' scrollbar-horizontal'
        classes += this.props.draggableEndpoints ? ' scrollbar-draggable-endpoints' : ''
    return classes
  }

  render() {
    let scrollPosition = this.props.vertical
                       ? { top:  100*this.props.min+'%', bottom: 100*(1-this.props.max)+'%' }
                       : { left: 100*this.props.min+'%', right:  100*(1-this.props.max)+'%' }
    return (
      <div className={this.gutterClass()} ref={(ref) => this.gutter = ref}>
        <div className="scrollbar-bar"    ref={(ref) => this.bar    = ref} style={scrollPosition}>
          <div className="scrollbar-min"  ref={(ref) => this.min    = ref} />
          <div className="scrollbar-max"  ref={(ref) => this.max    = ref} />
        </div>
      </div>
    )
  }
}

Scrollbar.propTypes = {
  vertical: React.PropTypes.bool,
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired,
  setScroll: React.PropTypes.func.isRequired,
  draggableEndpoints: React.PropTypes.bool,
  forceHover: React.PropTypes.bool
}

export default connect()(Scrollbar)
