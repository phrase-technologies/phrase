// ============================================================================
// GridScroll Provider Component
// ============================================================================
// This is a Higher-Order-Component (HOC) which provides scrolling and zooming
// handling to the child component. It simply attaches event handlers and hooks
// them up into the provided action creators.
//
// See also: GridScrollProvider.js

import React, { Component } from 'react';

import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';

var provideGridScroll = function(
  ChildComponent,
  {
    scrollXActionCreator = null,
    scrollYActionCreator = null,
    cursorActionCreator = null
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

      if( scrollXActionCreator && ( this.props.barMin || this.props.barMax ) )
      {
        var fulcrumX = this.props.grid.getMouseXPercent(e)
        var [newBarMin, newBarMax] = zoomInterval([this.props.barMin, this.props.barMax], zoomFactor, fulcrumX)
        this.props.dispatch(scrollXActionCreator(newBarMin, newBarMax))
      }

      if( scrollYActionCreator && ( this.props.keyMin || this.props.keyMax ) )
      {
        var fulcrumY = this.props.grid.getMouseYPercent(e)
        var [newKeyMin, newKeyMax] = zoomInterval([this.props.keyMin, this.props.keyMax], zoomFactor, fulcrumY)
        this.props.dispatch(scrollYActionCreator(newKeyMin, newKeyMax))
      }
    }
    handleScrollX(e) {
      if( scrollXActionCreator && ( this.props.barMin || this.props.barMax ) )
      {
        var barWindow = this.props.barMax - this.props.barMin
        var barStepSize = e.deltaX / this.props.grid.container.clientWidth * barWindow
        var [newBarMin, newBarMax] = shiftInterval([this.props.barMin, this.props.barMax], barStepSize)
        this.props.dispatch(scrollXActionCreator(newBarMin, newBarMax))
      }
    }
    handleScrollY(e) {
      if( scrollYActionCreator && ( this.props.keyMin || this.props.keyMax ) )
      {
        var keyWindow = this.props.keyMax - this.props.keyMin
        var keyStepSize = e.deltaY / this.props.grid.container.clientHeight * keyWindow
        var [newKeyMin, newKeyMax] = shiftInterval([this.props.keyMin, this.props.keyMax], keyStepSize)
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