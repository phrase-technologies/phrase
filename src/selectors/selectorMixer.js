import { createSelector } from 'reselect'

import { getOffsetedTrackID } from '../helpers/trackHelpers.js'
import { negativeModulus } from '../helpers/intervalHelpers.js'
import { clipSelectionOffsetValidated } from './selectorPianoroll.js'

const tracksSelector            = (state) => (state.phrase.present.tracks)
const clipsSelector             = (state) => (state.phrase.present.clips)
const selectionTypeSelector     = (state) => (state.phraseMeta.selectionType)
const trackSelectionIDsSelector = (state) => (state.phraseMeta.trackSelectionIDs)
const clipSelectionIDsSelector  = (state) => (state.phraseMeta.clipSelectionIDs)

export const renderedTracksSelector = createSelector(
  selectionTypeSelector,
  tracksSelector,
  trackSelectionIDsSelector,
  (selectionType, tracks, trackSelectionIDs) => {
    // Render Offseted Selections
    tracks = (tracks || [])
      .map(track => {
        let isTrackSelected = trackSelectionIDs.some(x => x === track.id)
        if (isTrackSelected) {
          return {
            ...track,
            selected: true,
          }
        }
        return track
      })

    return tracks
  }
)

export const renderedClipsSelector = createSelector(
  selectionTypeSelector,
  tracksSelector,
  clipsSelector,
  clipSelectionIDsSelector,
  clipSelectionOffsetValidated,
  (selectionType, tracks, clips, clipSelectionIDs, { offsetStart, offsetEnd, offsetTrack, offsetLooped }) => {
    // Escape if nothing selected
    if (selectionType !== "clips")
      return clips

    // Render Offseted Selections
    let clipSelectionOffsetPreview = []
    clips = (clips || [])
      .map(clip => {
        let isClipSelected = clipSelectionIDs.some(x => x === clip.id)
        if (isClipSelected) {
          // Even if looping was indicated in the cursor, other selected clips may be already looped and must remain so
          let validatedOffsetLooped = offsetLooped || (clip.end - clip.start !== clip.loopLength)

          // Offset clip - generate duplicate preview with any offset (from drag and drop)
          if ((offsetStart && offsetEnd) || offsetTrack) {
            clipSelectionOffsetPreview.push({
              ...clip,
              start:  clip.start  + offsetStart,
              end:    clip.end    + offsetEnd,
              offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
              loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
              trackID: getOffsetedTrackID(clip.trackID, offsetTrack, tracks),
            })

            // Render the original clip as selected
            return {
              ...clip,
              selected: true,
            }
          }

          // Resized clip - render as selected
          return {
            ...clip,
            start:  clip.start  + offsetStart,
            end:    clip.end    + offsetEnd,
            offset: validatedOffsetLooped && offsetStart !== offsetEnd ? negativeModulus(clip.offset - offsetStart, clip.loopLength) : clip.offset,
            loopLength: validatedOffsetLooped ? clip.loopLength : (clip.end + offsetEnd - clip.start - offsetStart),
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
    return (tracks || []).some(track => track.solo)
  }
)
