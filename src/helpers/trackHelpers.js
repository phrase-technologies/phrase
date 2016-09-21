import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from 'helpers/colors'

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
  let pixels = 0
  let i = 0
  while((tracks[i] || {}).id !== targetTrackID && i < tracks.length) {
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

  let originalIndex = allTracks.findIndex(track => track.id == currentTrackID) // This should stay as ==, not ===. Casting string to int.
  let offsetedIndex = originalIndex + offset
  return allTracks[offsetedIndex].id
}

export function barToString(bar, majorIncrement = 1.0) {
  let barNumber = Math.floor(bar + 1)
  let barBeat = ((bar + 1) % 1) * 4 + 1
  return (majorIncrement < 1.0) ? (barNumber + '.' + barBeat) : barNumber
}

export function getDarkenedColor(color, shadeFactor, alpha = 1.0) {
  let [ r, g, b ] = hexToRgb(color)

  let brightness = 1.0 - shadeFactor

  let r2 = Math.floor(r*brightness).toString(16)
  let g2 = Math.floor(g*brightness).toString(16)
  let b2 = Math.floor(b*brightness).toString(16)

  if (typeof alpha === 'number' && alpha < 1.0 && alpha >= 0.0) {
    let r3 = parseInt(r2+r2, 16)
    let g3 = parseInt(g2+g2, 16)
    let b3 = parseInt(b2+b2, 16)
    let darkenedTransparentedColor = `rgba(${r3},${g3},${b3},${alpha})`
    return darkenedTransparentedColor
  }

  let darkenedColor = `#${r2}${g2}${b2}`
  return darkenedColor
}

export function desaturateFromVelocity (color, velocity) {
  let rgb = hexToRgb(color)
  let [ h, s, l ] = rgbToHsl(...rgb)

  s *= velocity / 127
  rgb = hslToRgb(h, s, l)

  return rgbToHex(...rgb)
}
