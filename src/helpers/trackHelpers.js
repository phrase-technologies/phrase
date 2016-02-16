// ----------------------------------------------------------------------------
// Track Helpers
// ----------------------------------------------------------------------------

export function getTrackHeight(track) {
  return 52 // Each standard track is 52px tall
  // When we have automation or collapsible tracks this will change!
}

// Calculates the total content height of the tracks in the mixer.
export function getTracksHeight(tracks) {
  return tracks.reduce((contentHeight, track) => {
    return contentHeight + getTrackHeight(track)
  }, 55) // The "+Add Track" button is 55px tall
}

// Calculates the total distance from the top of the
// track list to the target track, in pixels
export function getPixelsToTrack(tracks, targetTrackID) {
  var pixels = 0
  var i = 0
  while(tracks[i].id != targetTrackID && i < tracks.length) {
    pixels += getTrackHeight(tracks[i])
    i++
  }
  return pixels
}

// Get the ID of the track in @allTracks that is @offset from @currentTrackID
// e.g. @offset = -1, get the track in @allTracks that comes before @currentTrackID
export function getOffsetedTrackID(currentTrackID, offset, allTracks) {
  if (!offset)
    return currentTrackID

  var originalIndex = allTracks.findIndex(track => track.id == currentTrackID)
  var offsetedIndex = originalIndex + offset
  return allTracks[offsetedIndex].id
}

