
export const getNewScroll = ({ min, max, playhead, barCount }) => {
  let viewWidth = max - min
  let playheadPercent = playhead / barCount
  if (max < 1 && (max - playheadPercent) < 0) {
    let newMax = Math.min(1, playheadPercent + viewWidth)
    let offset = (newMax < 1) ? 0.05 * viewWidth : 0
    return { min: newMax - viewWidth - offset, max: newMax - offset }
  }
  else if (min > 0 && (playheadPercent - min) < 0) {
    let newMin = Math.max(0, playheadPercent - viewWidth)
    let offset = (newMin > 0) ? 0.05 * viewWidth : 0
    return { min: newMin + offset, max: newMin + viewWidth + offset }
  }
  return null
}
