import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { cursorResizeRow,
         cursorDrop } from '../actions/actionsCursor.js'

export default class WorkstationSplit extends Component {

  render() {
    let scrollPosition

    if (this.props.splitRatio === null)
      scrollPosition = { display: 'none' }
    else if (this.props.splitRatio < 0.2)
      scrollPosition = { top: 0 + 2 }
    else if (this.props.splitRatio > 0.8)
      scrollPosition = { bottom: 0 - 4 + 3 }
    else
      scrollPosition = { top: (this.props.splitRatio * 100) + '%' }

    return (
      <div className="workstation-split">
        <div
          className="workstation-split-handle"
          style={scrollPosition}
        />
      </div>
    )
  }

  componentDidMount() {
    this.data = this.data || {}
    this.data.container = ReactDOM.findDOMNode(this)
    this.data.isDragging = false

    this.data.container.addEventListener('mousedown', this.handleGrip)
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup',   this.handleDrop)
    document.addEventListener('mousedown', this.handleDrop)
  }

  componentWillUnmount() {
    this.data.container.removeEventListener('mousedown', this.handleGrip)
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup',   this.handleDrop)
    document.removeEventListener('mousedown', this.handleDrop)

    this.data = null
  }

  handleGrip = () => {
    // Start the drag
    this.data.isDragging = true
    this.props.dispatch(cursorResizeRow())
  }

  handleDrag = (e) => {
    // Ignore moves that aren't drag-initiated
    if (!this.data.isDragging)
      return

    let percentDelta = (e.clientY - this.data.container.getBoundingClientRect().top) / this.data.container.clientHeight
        percentDelta = percentDelta > 1.0 ? 1.0 : percentDelta
        percentDelta = percentDelta < 0.0 ? 0.0 : percentDelta

    this.props.setRatio(percentDelta)
  }

  handleDrop = (e) => {
    // Ignore left clicks - those are not drops
    if (e.type === 'mousedown' && e.which === 1)
      return

    // End the drag
    this.data.isDragging = false
    this.props.dispatch(cursorDrop('explicit'))
    this.forceUpdate()
  }
}

WorkstationSplit.propTypes = {
  splitRatio: React.PropTypes.number,
  setRatio:   React.PropTypes.func.isRequired
}

export default connect()(WorkstationSplit)
