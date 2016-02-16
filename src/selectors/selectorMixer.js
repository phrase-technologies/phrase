import { createSelector } from 'reselect';
import u from 'updeep';

import { getOffsetedTrackID } from '../helpers/trackHelpers.js'

const tracksSelector            = (state) => ( state.phrase.tracks )
const clipsSelector             = (state) => ( state.phrase.clips )
const clipSelectionOffsetStart  = (state) => ( state.phrase.clipSelectionOffsetStart )
const clipSelectionOffsetEnd    = (state) => ( state.phrase.clipSelectionOffsetEnd )
const clipSelectionOffsetTrack  = (state) => ( state.phrase.clipSelectionOffsetTrack )
export const selectedClipsSelector = createSelector(
  clipsSelector,
  (clips) => {
    return clips.filter(clip => clip.selected)
  }
)
export const renderedClipsSelector = createSelector(
  tracksSelector,
  clipsSelector,
  selectedClipsSelector,
  clipSelectionOffsetStart,
  clipSelectionOffsetEnd,
  clipSelectionOffsetTrack,
  (tracks, clips, selectedClips, offsetStart, offsetEnd, offsetTrack) => {
    // Render Offseted Selections
    var selectedClipsRendered = []
    if (offsetStart || offsetEnd || offsetTrack) {
      selectedClipsRendered = selectedClips
        .map(clip => {
          return u.freeze({
            ...clip,
            start:  clip.start  + offsetStart,
            end:    clip.end    + offsetEnd,
            trackID: getOffsetedTrackID(clip.trackID, offsetTrack, tracks),
            selected: offsetStart && offsetEnd || offsetTrack ? false : true
          })
        })
    }

    // Render a copy of each clip with their rendered selections appended
    return clips
      .concat(selectedClipsRendered)
  }
)
