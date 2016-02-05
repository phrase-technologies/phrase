// ============================================================================
// GridScroll Provider Component
// ============================================================================
// This is a Higher-Order-Component (HOC) which provides scrolling and zooming
// handling to the child component. It simply attaches event handlers and hooks
// them up into the provided action creators.
//
// It is dependent on GridSystemProvider.
// See: GridSystemProvider.js

import React, { Component } from 'react';

import { shiftInterval,
         zoomInterval } from '../helpers/intervalHelpers.js';

var provideGridScroll = function(
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

    constructor(){
      super(...arguments)

      this.handleScrollWheel = this.handleScrollWheel.bind(this)
      this.handleMouseMove = this.handleMouseMove.bind(this)
    }

    componentDidMount() {
      this.props.grid.didMount()
      this.props.grid.container.addEventListener("wheel", this.handleScrollWheel)
      this.props.grid.container.addEventListener("mousemove", this.handleMouseMove)
    }

    componentWillUnmount() {
      this.props.grid.container.removeEventListener("wheel", this.handleScrollWheel)
      this.props.grid.container.removeEventListener("mousemove", this.handleMouseMove)
    }

    // Scrolling and zooming within the timeline
    handleScrollWheel(e) {
      e.preventDefault()
      // e.stopPropagation(); propogation is needed for vertical scrolling on the mixer

      // Zoom when CTRL or META key pressed
      if( e.ctrlKey || e.metaKey )
        this.handleZoom(e)

      // Scroll otherwise - snap the scroll to either X or Y direction, feels too jumpy when dual XY scrolling
      else if( Math.abs(e.deltaX) >= Math.abs(e.deltaY) )
        this.handleScrollX(e)
      else
        this.handleScrollY(e)
    }
    handleZoom(e) {
      var zoomFactor = (e.deltaY + 500) / 500

      if( scrollXActionCreator && enableZoomX )
      {
        var fulcrumX = this.props.grid.getMouseXPercent(e)
        var [newBarMin, newBarMax] = zoomInterval([this.props.xMin, this.props.xMax], zoomFactor, fulcrumX)
        this.props.dispatch(scrollXActionCreator(newBarMin, newBarMax))
      }
      if( scrollYActionCreator && enableZoomY )
      {
        var fulcrumY = this.props.grid.getMouseYPercent(e)
        var [newKeyMin, newKeyMax] = zoomInterval([this.props.yMin, this.props.yMax], zoomFactor, fulcrumY)
        this.props.dispatch(scrollYActionCreator(newKeyMin, newKeyMax))
      }
    }
    handleScrollX(e) {
      if( scrollXActionCreator )
      {
        var barWindow = this.props.xMax - this.props.xMin
        var barStepSize = e.deltaX / this.props.grid.container.clientWidth * barWindow
        var [newBarMin, newBarMax] = shiftInterval([this.props.xMin, this.props.xMax], barStepSize)
        this.props.dispatch(scrollXActionCreator(newBarMin, newBarMax))
      }
    }
    handleScrollY(e) {
      if( scrollYActionCreator )
      {
        var keyWindow = this.props.yMax - this.props.yMin
        var keyStepSize = e.deltaY / this.props.grid.container.clientHeight * keyWindow
        var [newKeyMin, newKeyMax] = shiftInterval([this.props.yMin, this.props.yMax], keyStepSize)
        this.props.dispatch(scrollYActionCreator(newKeyMin, newKeyMax))
      }
    }
    handleMouseMove(e) {
      if( cursorActionCreator )
      {
        var percent = this.props.grid.getMouseXPercent(e)
        this.props.dispatch(cursorActionCreator(percent))
      }
    }

  }

  GridScroll.propTypes = {
    grid: React.PropTypes.object.isRequired
  }

  return GridScroll

}

export default provideGridScroll