// ----------------------------------------------------------------------------
// HELPERS
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
export function zoomInterval(interval, zoom, fulcrum = 0.5, limit = [0.0, 1.0]) {
  var [newMin, newMax] = interval;
  var range = newMax - newMin;
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