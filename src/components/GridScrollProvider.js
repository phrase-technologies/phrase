// ============================================================================
// GridScroll Provider Component
// ============================================================================
// This is a Higher-Order-Component (HOC) which provides scrolling and zooming
// handling to the child component. It simply attaches event handlers and hooks
// them up into the provided action creators.
//
// It is dependent on GridSystemProvider.
// See: GridSystemProvider.js

import React, { Component } from 'react'

import { cursor } from 'actions/actions'
import { shiftInterval } from '../helpers/intervalHelpers.js'

let provideGridScroll = function(
  ChildComponent,
  {
    scrollXActionCreator = null,
    scrollYActionCreator = null,
    cursorActionCreator = null,
    enableZoomX = true,
    enableZoomY = true
  }
) {

  class GridScroll extends Component {

    render() {
      return (
        <ChildComponent {...this.props} />
      )
    }

    componentDidMount() {
      this.props.grid.didMount()
      this.props.grid.container.addEventListener('wheel', this.handleScrollWheel)
      this.props.grid.container.addEventListener('mousemove', this.handleMouseMove)
      this.props.grid.container.addEventListener('mouseout', this.handleMouseOut)
    }

    componentWillUnmount() {
      this.props.grid.container.removeEventListener('wheel', this.handleScrollWheel)
      this.props.grid.container.removeEventListener('mousemove', this.handleMouseMove)
      this.props.grid.container.removeEventListener('mouseout', this.handleMouseOut)
    }

    // Scrolling and zooming within the timeline
    handleScrollWheel = (e) => {
      e.preventDefault()
      // e.stopPropagation(); propogation is needed for vertical scrolling on the mixer

      // Zoom when CTRL or META key pressed
      if (e.ctrlKey || e.metaKey)
        this.handleZoom(e)

      // Scroll otherwise - snap the scroll to either X or Y direction, feels too jumpy when dual XY scrolling
      else if (Math.abs(e.deltaX) >= Math.abs(e.deltaY))
        this.handleScrollX(e)
      else
        this.handleScrollY(e)
    }
    handleZoom(e) {
      if (scrollXActionCreator && enableZoomX) {
        let fulcrumX = this.props.grid.getMouseXPercent(e)
        this.props.dispatch(scrollXActionCreator({ delta: e.deltaY, fulcrum: fulcrumX }))
      }
      if (scrollYActionCreator && enableZoomY) {
        let fulcrumY = this.props.grid.getMouseYPercent(e)
        this.props.dispatch(scrollYActionCreator({ delta: e.deltaY, fulcrum: fulcrumY }))
      }
    }
    handleScrollX(e) {
      if (scrollXActionCreator) {
        let barWindow = this.props.xMax - this.props.xMin
        let barStepSize = e.deltaX / this.props.grid.container.clientWidth * barWindow
        let [newBarMin, newBarMax] = shiftInterval([this.props.xMin, this.props.xMax], barStepSize)
        this.props.dispatch(scrollXActionCreator({ min: newBarMin, max: newBarMax }))
      }
    }
    handleScrollY(e) {
      if (scrollYActionCreator) {
        let keyWindow = this.props.yMax - this.props.yMin
        let keyStepSize = e.deltaY / this.props.grid.container.clientHeight * keyWindow
        let [newKeyMin, newKeyMax] = shiftInterval([this.props.yMin, this.props.yMax], keyStepSize)
        this.props.dispatch(scrollYActionCreator({ min: newKeyMin, max: newKeyMax }))
      }
    }
    handleMouseMove = (e) => {
      if (cursorActionCreator) {
        let percent = this.props.grid.getMouseXPercent(e)
        this.props.dispatch(cursorActionCreator(percent))
      }
    }
    handleMouseOut = () => {
      if (cursorActionCreator) {
        this.props.dispatch(cursorActionCreator(null))
        this.props.dispatch({ type: cursor.DEFAULT, priority: 'explicit' })
      }
    }

  }

  GridScroll.propTypes = {
    grid: React.PropTypes.object.isRequired
  }

  return GridScroll

}

export default provideGridScroll
