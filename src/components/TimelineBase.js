// ============================================================================
// Timeline Base Component
// ============================================================================
// This is a custom-rolled base component which you should use if you are
// building a component that scrolls through and displays a timeline.
// It takes care of the scroll handling, vertical and horizontal windowing,
// and provides some helper methods for grid calculations to translate
// between grid coordinates and pixels.
//
// Simply extend this component and pass down prop.dispatch, and 1 or both of:
//
//   Horizontal Windowing              Vertical Windowing
//   -> this.props.barMin   ...OR...   -> this.props.keyMin
//   -> this.props.barMax              -> this.props.keyMax
// 
// NOTE / TODO:
// - Instead of accepting prop.dispatch, accept the entire action as a function
// - Will be necessary when we decouple the pianoroll timeline from
//   the arrangment timeline. 
// - Update the above docs when done!

import React from 'react';
import CanvasComponent from './CanvasComponent';

import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY,
         timelineCursor } from '../actions/actions.js';

export default class TimelineBase extends CanvasComponent {
  constructor(){
    super();

    this.data = this.data || {};
    this.data.marginTop    = 0;
    this.data.marginBottom = 0;
    this.data.marginLeft   = 0;
    this.data.marginRight  = 0;

    this.handleScrollWheel = this.handleScrollWheel.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    this.data.container.addEventListener("wheel", this.handleScrollWheel);
    this.data.container.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    this.data.container.removeEventListener("wheel", this.handleScrollWheel);
    this.data.container.removeEventListener("mousemove", this.handleMouseMove);
    super.componentWillUnmount();
  }

  // Calculate thresholds at which to draw barline thicknesses
  calculateZoomThreshold() {
    if( this.props.barMin || this.props.barMax )
    {
      var pixelsPerBar = this.getActiveWidth() / (this.props.barCount*this.getBarRange());

      var thresholds = [
        { threshold:   10.0, majorLine: 16.000, middleLine: 4.0000, minorLine:  null     },
        { threshold:   20.0, majorLine: 16.000, middleLine: 4.0000, minorLine:  1.0000   },
        { threshold:   40.0, majorLine:  4.000, middleLine: 1.0000, minorLine:  null     },
        { threshold:   80.0, majorLine:  4.000, middleLine: 1.0000, minorLine:  0.2500   },
        { threshold:  160.0, majorLine:  1.000, middleLine: 0.2500, minorLine:  null     },
        { threshold:  320.0, majorLine:  1.000, middleLine: 0.2500, minorLine:  0.0625   },
        { threshold:  640.0, majorLine:  0.250, middleLine: 0.0625, minorLine:  null     },
        { threshold: 1280.0, majorLine:  0.250, middleLine: 0.0625, minorLine:  0.015625 }
      ];

      // Find the first threshold that fits
      this.data.lineThicknessThresholds = thresholds.find(function(x){
        return x.threshold > pixelsPerBar || x.threshold > 800; // Always use last one (800) if we get there
      });
    }
  }

  // Grid Calculations
  getBarRange(){ return this.props.barMax - this.props.barMin; };
  getKeyRange(){ return this.props.keyMax - this.props.keyMin; };
  getActiveHeight(){ return this.data.height - this.data.pixelScale*(this.data.marginTop  + this.data.marginBottom); };
  getActiveWidth (){ return this.data.width  - this.data.pixelScale*(this.data.marginLeft + this.data.marginRight ); };
  keyToYCoord(key){ return ( ( key / this.props.keyCount ) - this.props.keyMin ) / this.getKeyRange() * this.getActiveHeight() + this.data.pixelScale*this.data.marginTop;  };
  barToXCoord(bar){ return ( ( bar / this.props.barCount ) - this.props.barMin ) / this.getBarRange() * this.getActiveWidth()  + this.data.pixelScale*this.data.marginLeft; };
  percentToKey(percent){ return Math.ceil( percent * this.props.keyCount ); }; // Where percent is between 0.000 and 1.000
  percentToBar(percent){ return Math.ceil( percent * this.props.barCount ); }; // Where percent is between 0.000 and 1.000
  getMouseYPercent(e){ return this.data.pixelScale * (e.clientY - this.data.container.getBoundingClientRect().top - this.data.marginTop)  / this.getActiveHeight(); }
  getMouseXPercent(e){ return this.data.pixelScale * (e.clientX - this.data.container.getBoundingClientRect().left - this.data.marginLeft) / this.getActiveWidth(); }

  // Scrolling and zooming within the timeline
  handleScrollWheel(e) {
    e.preventDefault();

    // Zoom when CTRL or META key pressed
    if( e.ctrlKey || e.metaKey )
      this.handleZoom(e);

    // Scroll otherwise
    else
    {
      this.handleScrollX(e);
      this.handleScrollY(e);
    }
  }
  handleZoom(e) {
    var zoomFactor = (e.deltaY + 500) / 500;

    if( this.props.barMin || this.props.barMax )
    {
      var fulcrumX = this.getMouseXPercent(e);
      var [newBarMin, newBarMax] = zoomInterval([this.props.barMin, this.props.barMax], zoomFactor, fulcrumX);
      this.props.dispatch(pianoRollScrollX(newBarMin, newBarMax));
    }

    if( this.props.keyMin || this.props.keyMax )
    {
      var fulcrumY = this.getMouseYPercent(e);
      var [newKeyMin, newKeyMax] = zoomInterval([this.props.keyMin, this.props.keyMax], zoomFactor, fulcrumY);
      this.props.dispatch(pianoRollScrollY(newKeyMin, newKeyMax));
    }
  }
  handleScrollX(e) {
    if( this.props.barMin || this.props.barMax )
    {
      var barWindow = this.props.barMax - this.props.barMin;
      var barStepSize = e.deltaX / this.data.container.clientWidth * barWindow;    
      var [newBarMin, newBarMax] = shiftInterval([this.props.barMin, this.props.barMax], barStepSize);
      this.props.dispatch(pianoRollScrollX(newBarMin, newBarMax));
    }
  }
  handleScrollY(e) {
    if( this.props.keyMin || this.props.keyMax )
    {
      var keyWindow = this.props.keyMax - this.props.keyMin;
      var keyStepSize = e.deltaY / this.data.container.clientHeight * keyWindow;
      var [newKeyMin, newKeyMax] = shiftInterval([this.props.keyMin, this.props.keyMax], keyStepSize);
      this.props.dispatch(pianoRollScrollY(newKeyMin, newKeyMax));
    }
  }
  handleMouseMove(e) {
    var percent = this.getMouseXPercent(e);
    console.log( percent );
    this.props.dispatch(timelineCursor(percent));
  }
}
