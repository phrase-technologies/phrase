// ============================================================================
// Windowing Helpers
// ============================================================================

// ----------------------------------------------------------------------------
// Shifts an interval, e.g. [0.4, 0.6], without exceeding a specified limit
export function shiftInterval(interval, shift, limit = [0.0, 1.0]) {
  let [newMin, newMax] = interval
  newMin += shift
  newMax += shift
  if (newMin < limit[0]) {
    newMax -= newMin
    newMin = limit[0]
  }
  if (newMax > limit[1]) {
    newMin -= (newMax - limit[1])
    newMax = limit[1]
  }
  return [newMin, newMax]
}

// ----------------------------------------------------------------------------
// Expands or contracts an interval, e.g. [0.4, 0.6], without exceeding a specified limit
export function zoomInterval(interval, zoom, fulcrum = undefined, limit = [0.0, 1.0]) {
  let [newMin, newMax] = interval
  console.log(newMin)
  let range = newMax - newMin
  if (fulcrum === undefined)
    fulcrum = 0.5 * (newMin + newMax)
  let center = newMin + fulcrum*range
  range *= zoom
  newMin = center - (0.0 + fulcrum)*range
  newMax = center + (1.0 - fulcrum)*range
  if (newMin < limit[0]) {
    newMax -= newMin
    newMin = limit[0]
  }
  if (newMax > limit[1]) {
    newMin -= (newMax - limit[1])
    newMax = limit[1]
  }
  console.log(newMin)
  return [newMin, newMax]
}

// ----------------------------------------------------------------------------
// Make sure timeline (e.g. for pianoroll) doesn't zoom too close
export const maxBarWidth = 2000
export function restrictTimelineZoom(state, barCount) {
  let timelineWidth = state.width / (state.xMax - state.xMin)
  let barWidth = timelineWidth / barCount
  if (barWidth > maxBarWidth) {
    let [xMin, xMax] = zoomInterval([state.xMin, state.xMax], barWidth/maxBarWidth)
    state = {
      ...state,
      xMin,
      xMax
    }
  }
  return state
}

// ----------------------------------------------------------------------------
// Returns the closest negative distance to a repeating interval.
// Useful for calculating the start of the first loop in a clip.
export function negativeModulus(dividend, modulus) {
  return ((dividend % modulus) - modulus) % modulus
}

// ----------------------------------------------------------------------------
// Proportionally scales zooming in when it reaches below a range threshold between min and max x scroll values. Useful for fine tuning positional adjustments of notes
// Returns a new max value
export function zoomInScaling(min, max, increments = {normal: 0.05, scaling: 0.01}, threshold = 0.1) {
  // Round Number to 4 decimal places to deal with floating point errors
  let roundedMin = parseFloat(min.toFixed(4))
  let roundedMax = parseFloat(max.toFixed(4))
  let range = roundedMax - roundedMin

  // Case: Zooming in when approaching the threshold value 
  if (range > threshold && (range - threshold) <= increments.normal) {
    return roundedMin + threshold
  } else if (range <= threshold) {
    return Math.max(0.01, roundedMax - increments.scaling)
  } else {
    return Math.max(0.01, roundedMax - increments.normal)
  }
}

// ----------------------------------------------------------------------------
// Same as above for zooming out
// Returns a new max value
export function zoomOutScaling(min, max, increments = {normal: 0.05, scaling: 0.01}, threshold = 0.1) {
  // Round Number to 4 decimal places to deal with floating point errors
  let roundedMin = parseFloat(min.toFixed(4))
  let roundedMax = parseFloat(max.toFixed(4))
  let range = roundedMax - roundedMin

  // Case: Zooming Out when approaching the threshold value
  if (range < threshold && (range + increments.scaling) >= threshold) {
    return roundedMin + threshold
  } else if (range < threshold) {
    return Math.min(1.0, roundedMax + increments.scaling)
  } else {
    return Math.min(1.0, roundedMax + increments.normal)
  }
}