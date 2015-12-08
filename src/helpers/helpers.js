// ----------------------------------------------------------------------------
// Windowing Helpers
// ----------------------------------------------------------------------------

// Shifts an interval, e.g. [0.4, 0.6], without exceeding a specified limit
export function shiftInterval(interval, shift, limit = [0.0, 1.0]) {
  var [newMin, newMax] = interval;
  newMin += shift;
  newMax += shift;
  if( newMin < limit[0] )
  {
    newMax -= newMin;
    newMin = limit[0];
  }
  if( newMax > limit[1] )
  {
    newMin -= (newMax - limit[1]);
    newMax = limit[1];
  }
  return [newMin, newMax];
}

// Expands or contracts an interval, e.g. [0.4, 0.6], without exceeding a specified limit
export function zoomInterval(interval, zoom, fulcrum = undefined, limit = [0.0, 1.0]) {
  var [newMin, newMax] = interval;
  var range = newMax - newMin;
  if( fulcrum === undefined )
    fulcrum = 0.5 * (newMin + newMax);
  var center = newMin + fulcrum*range;
  range *= zoom;
  newMin = center - (0.0 + fulcrum)*range;
  newMax = center + (1.0 - fulcrum)*range;
  if( newMin < limit[0] )
  {
    newMax -= newMin;
    newMin = limit[0];
  }
  if( newMax > limit[1] )
  {
    newMin -= (newMax - limit[1]);
    newMax = limit[1];
  }
  return [newMin, newMax];
}


// --------------------------------------------------------------------------
// Canvas/Calculation helpers
// --------------------------------------------------------------------------

// In 2D vector graphics, single-pixel stroke width must be drawn at a half-pixel position, otherwise it gets sub-pixel blurring
export function closestHalfPixel(pixels){
  // parseInt is a hack for efficient rounding 
  return parseInt( 0.5 + pixels ) - 0.5;
}; 

export function drawLine(context, x1, y1, x2, y2, xyFlip, color) {
  if( color )
  {
    context.beginPath();
    context.strokeStyle = color;
  }

  if( xyFlip )
  {
    x1 = [y1, y1 = x1][0];
    x2 = [y2, y2 = x2][0];
  }
  context.moveTo( x1, y1 );
  context.lineTo( x2, y2 );

  if( color )
    context.stroke();
};

export function canvasReset(context, canvas, color) {
  context.fillStyle = color;
  context.fillRect( 0, 0, canvas.width, canvas.height );
};

