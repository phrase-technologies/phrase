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
