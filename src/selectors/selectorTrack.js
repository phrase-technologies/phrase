import { createSelector } from 'reselect';

const clipsSelector = (state) => {
  return state.phrase.clips
}
const trackSelector = (state, props) => {
  return props.track
}

export const mapClipsToTrack = createSelector(
  clipsSelector,
  trackSelector,
  (clips, track) => {
    return {
      clips: clips.filter(clip => {
        return clip.trackID == track.id
      })
    }
  }
)
