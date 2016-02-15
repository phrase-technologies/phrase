import { createSelector } from 'reselect';
import u from 'updeep';

const clipsSelector             = (state) => ( state.phrase.clips )
const clipSelectionOffsetStart  = (state) => ( state.phrase.clipSelectionOffsetStart )
const clipSelectionOffsetEnd    = (state) => ( state.phrase.clipSelectionOffsetEnd )
const clipSelectionOffsetTrack  = (state) => ( state.phrase.clipSelectionOffsetTrack )
export const renderedClipsSelector = createSelector(
  clipsSelector,
  clipSelectionOffsetStart,
  clipSelectionOffsetEnd,
  clipSelectionOffsetTrack,
  (clips, offsetStart, offsetEnd, offsetTrack) => {
    var selectedClipsRendered = []
    if (offsetStart || offsetEnd || offsetTrack) {
      selectedClipsRendered = clips
      .filter(clip => clip.selected)
      .map(clip => {
        return u.freeze({
          ...clip,
          start:  clip.start  + offsetStart,
          end:    clip.end    + offsetEnd,
          trackID: offsetTrack === null ? clip.trackID : offsetTrack,
          selected: offsetStart && offsetEnd || Math.round(offsetTrack) ? false : true
        })
      })
    }

    // Render a copy of each clip with their rendered selections appended
    return clips
      .concat(selectedClipsRendered)
  }
)
