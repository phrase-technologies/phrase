// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

// Shifts an interval, e.g. [0.4, 0.6], without exceeding a specified limit
export default function shiftInterval(interval, shift, limit = [0.0, 1.0]) {
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