import React, { Component } from 'react';

import _ from 'lodash';
import { closestHalfPixel,
         canvasReset,
         drawLine } from '../helpers/helpers.js';

import TimelineBase from './TimelineBase';

export default class MixerTrackWindow extends TimelineBase {

  constructor() {
    super(...arguments);
    this.className = "mixer-track-window";
    this.data.marginLeft   = 10;
    this.data.marginRight  = 7;
  }

  renderFrame() {
    var currentParams = {
      min: this.props.barMin,
      max: this.props.barMax,
      count: this.props.barCount
    };

    // Update the cached timeline if needed
    if( !MixerTrackWindow.cachedParams || !_.isEqual( MixerTrackWindow.cachedParams, currentParams ) )
    {
      this.calculateZoomThreshold();
      this.renderTimelineToCache()
      MixerTrackWindow.cachedParams = currentParams;
    }

    // Copy the cached timeline to the target canvas
    var timelineCopy = MixerTrackWindow.offlineCanvasContext.getImageData(0, 0, this.data.width, this.data.height);
    this.data.canvasContext.putImageData(timelineCopy, 0, 0);
  }

  renderTimelineToCache() {
    canvasReset(MixerTrackWindow.offlineCanvasContext, this.data.canvas, "#444444");

    // Draw lines for each beat
    MixerTrackWindow.offlineCanvasContext.lineWidth = 1.0;
    var minBar = this.percentToBar( this.props.barMin ) - 1;
    var maxBar = this.percentToBar( this.props.barMax );
    var minorIncrement = this.data.lineThicknessThresholds.minorLine || this.data.lineThicknessThresholds.middleLine;
    for( var bar = minBar; bar <= maxBar; bar += minorIncrement )
    {
      // Draw each line as a separate path (different colors)
      var xPosition = closestHalfPixel( this.barToXCoord( bar ) );

      // Major Bar lines
      if( bar % this.data.lineThicknessThresholds.majorLine === 0 )
        MixerTrackWindow.offlineCanvasContext.strokeStyle = "#222222";
      // Intermediary Bar lines
      else if( bar % this.data.lineThicknessThresholds.middleLine === 0 )
        MixerTrackWindow.offlineCanvasContext.strokeStyle = "#333333";
      // Minor Bar lines
      else if( this.data.lineThicknessThresholds.minorLine )
        MixerTrackWindow.offlineCanvasContext.strokeStyle = "#3C3C3C";

      MixerTrackWindow.offlineCanvasContext.beginPath();
      drawLine( MixerTrackWindow.offlineCanvasContext, xPosition, 0, xPosition, this.data.height );
      MixerTrackWindow.offlineCanvasContext.stroke();
    }    
  }

  handleResize() {
    super.handleResize();

    // Clear cache if resized
    if( MixerTrackWindow.offlineCanvas.width != this.data.width || MixerTrackWindow.offlineCanvas.height != this.data.height )
    {
      MixerTrackWindow.cachedParams = null;
      MixerTrackWindow.offlineCanvas.width  = this.data.width;
      MixerTrackWindow.offlineCanvas.height = this.data.height;
      MixerTrackWindow.offlineCanvasContext.scale( this.data.pixelScale, this.data.pixelScale );
    }
  }
}

// Offline rendering - since all MixerTrackWindow instances will have
// the same timeline, cache it here for re-use across all instances
MixerTrackWindow.cachedParams = null;
MixerTrackWindow.offlineCanvas = document.createElement('canvas');
MixerTrackWindow.offlineCanvasContext = MixerTrackWindow.offlineCanvas.getContext("2d");
MixerTrackWindow.frameCount = 0;

MixerTrackWindow.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  barMin:       React.PropTypes.number.isRequired,
  barMax:       React.PropTypes.number.isRequired
};  
