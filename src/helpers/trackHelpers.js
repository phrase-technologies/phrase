// ----------------------------------------------------------------------------
// Track Helpers
// ----------------------------------------------------------------------------

export function getTrackHeight(track) {
  return 52 // Each standard track is 52px tall
  // When we have automation or collapsible tracks this will change!
}

// Calculates the total content height of the tracks in the mixer.
export function getTracksHeight(tracks) {
  return (tracks || []).reduce((contentHeight, track) => {
    return contentHeight + getTrackHeight(track)
  }, 55) // The "+Add Track" button is 55px tall
}

// Calculates the total distance from the top of the
// track list to the target track, in pixels
export function getPixelsToTrack(tracks, targetTrackID) {
  var pixels = 0
  var i = 0
  while((tracks[i] || {}).id != targetTrackID && i < tracks.length) {
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

export function getDarkenedColor(color, shadeFactor, alpha = 1.0) {
  if (typeof color != 'string' || color[0] != '#' || color.length != 4)
    throw Error('Invalid Color: ' + color + ' - must be in the form of #XXX')

  var r = parseInt(color[1], 16)
  var g = parseInt(color[2], 16)
  var b = parseInt(color[3], 16)

  var brightness = 1.0 - shadeFactor

  var r2 = Math.floor(r*brightness).toString(16)
  var g2 = Math.floor(g*brightness).toString(16)
  var b2 = Math.floor(b*brightness).toString(16)

  if (typeof alpha == 'number' && alpha < 1.0 && alpha >= 0.0) {
    var r3 = parseInt(r2+r2, 16)
    var g3 = parseInt(g2+g2, 16)
    var b3 = parseInt(b2+b2, 16)
    var darkenedTransparentedColor = `rgba(${r3},${g3},${b3},${alpha})`
    return darkenedTransparentedColor
  } else {
    var darkenedColor = `#${r2}${g2}${b2}`
    return darkenedColor
  }
}
