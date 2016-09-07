
export const getNewScroll = ({ min, max, playhead, barCount }) => {
  let viewWidth = max - min
  let playheadPercent = playhead / barCount
  if (isPlayheadAhead(max, playheadPercent)) {
    let newMax = Math.min(1, playheadPercent + viewWidth)
    let offset = (newMax < 1) ? 0.05 * viewWidth : 0
    return { min: newMax - viewWidth - offset, max: newMax - offset }
  }
  else if (isPlayheadBehind(min, playheadPercent)) {
    let newMin = Math.max(0, playheadPercent - viewWidth)
    let offset = (newMin > 0) ? 0.05 * viewWidth : 0
    return { min: newMin + offset, max: newMin + viewWidth + offset }
  }
  return null
}

export const isPlayheadInView = ({ min, max, playhead, barCount }) => {
  let playheadPercent = playhead / barCount
  return !isPlayheadAhead(max, playheadPercent) && !isPlayheadBehind(min, playheadPercent)
}

const isPlayheadAhead = (max, playheadPercent) => {
  return max < 1 && (max - playheadPercent) < 0
}

const isPlayheadBehind = (min, playheadPercent) => {
  return min > 0 && (playheadPercent - min) < 0
}
