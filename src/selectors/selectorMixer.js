import { createSelector } from 'reselect'

import { getOffsetedTrackID } from '../helpers/trackHelpers.js'
import { negativeModulus } from '../helpers/intervalHelpers.js'
import { clipSelectionOffsetValidated } from './selectorPianoroll.js'

const tracksSelector            = (state) => (state.phrase.present.tracks)
const clipsSelector             = (state) => (state.phrase.present.clips)
const clipSelectionIDs          = (state) => (state.selection.clipSelectionIDs)

export const renderedClipsSelector = createSelector(
  tracksSelector,
  clipsSelector,
  clipSelectionIDs,
  clipSelectionOffsetValidated,
  (tracks, clips, clipSelectionIDs, { offsetStart, offsetEnd, offsetTrack, offsetLooped }) => {
    // Render Offseted Selections
    let clipSelectionOffsetPreview = []
    clips = clips
      .map(clip => {
        let isClipSelected = clipSelectionIDs.some(x => x === clip.id)
        if (isClipSelected) {
          // Generate a preview of any offset on clip selection (from drag and drop)
          if (offsetStart || offsetEnd || offsetTrack) {
            clipSelectionOffsetPreview.push({
              ...clip,
              start:  clip.start  + offsetStart,
              end:    clip.end    + offsetEnd,
              offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
              loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
              trackID: getOffsetedTrackID(clip.trackID, offsetTrack, tracks),
            })
          }

          // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
          let validatedOffsetLooped = offsetLooped || (clip.end - clip.start !== clip.loopLength)
          // Render the selected clip as selected
          return {
            ...clip,
            selected: true,
          }
        }
        return clip
      })

    // Render a copy of each clip with their rendered selections appended
    return clips
      .concat(clipSelectionOffsetPreview)
  }
)

export const atleastOneTrackSoloedSelector = createSelector(
  tracksSelector,
  (tracks) => {
    return tracks.some(track => track.solo)
  }
)
