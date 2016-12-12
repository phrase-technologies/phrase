import { createSelector } from 'reselect'

const barCountSelector = (state) => {
  return state.phrase.present.barCount
}
const clipsSelector = (state) => {
  return state.phrase.present.clips
}
const trackSelector = (state, props) => {
  return props.track
}
const selectionOffsetBar = (state) => {
  return state.phrase.present.clipselectionOffsetBar
}
const selectionOffsetTrack = (state) => {
  return state.phrase.present.clipselectionOffsetTrack
}

export const mapClipsToTrack = createSelector(
  clipsSelector,
  trackSelector,
  selectionOffsetBar,
  selectionOffsetTrack,
  barCountSelector,
  (clips, track, offsetBar, offsetTrack, barCount) => {
    var currentClips = clips.filter(clip => {
      if (clip.selected)
        return track.id == clip.trackID + offsetTrack
      else
        return track.id == clip.trackID
    })
    var renderedClips = currentClips.map(clip => {
      if (clip.selected) {
        return {
          ...clip,
          start: clip.start + offsetBar*barCount,
          end:   clip.end   + offsetBar*barCount
        }
      } else {
        return clip
      }
    })
    return {
      clips: renderedClips
    }
  }
)
