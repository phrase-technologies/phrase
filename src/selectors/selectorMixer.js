import { createSelector } from 'reselect'
import u from 'updeep'

import { getOffsetedTrackID } from '../helpers/trackHelpers.js'
import { negativeModulus } from '../helpers/intervalHelpers.js'
import { clipSelectionOffsetValidated } from './selectorPianoroll.js'

const tracksSelector            = (state) => (state.phrase.present.tracks)
const clipsSelector             = (state) => (state.phrase.present.clips)

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
  clipSelectionOffsetValidated,
  (tracks, clips, selectedClips, { offsetStart, offsetEnd, offsetTrack, offsetLooped }) => {
    // Render Offseted Selections
    let selectedClipsRendered = []
    if (offsetStart || offsetEnd || offsetTrack) {
      selectedClipsRendered = selectedClips
        .map(clip => {
          // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
          let validatedOffsetLooped = offsetLooped || (clip.end - clip.start !== clip.loopLength)

          return u.freeze({
            ...clip,
            start:  clip.start  + offsetStart,
            end:    clip.end    + offsetEnd,
            offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
            loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
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

export const atleastOneTrackSoloedSelector = createSelector(
  tracksSelector,
  (tracks) => {
    return tracks.some(track => track.solo)
  }
)
