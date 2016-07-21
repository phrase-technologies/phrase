// ============================================================================
// MIDI TRIGGERS
// ============================================================================
// This triggers can be used to schedule sounds at:
// a) Specific timestamps relative to the AudioContext (i.e. engine.ctx)
// b) In real-time, if time is ommitted
const keyFrequency = {} // Set the frequencies for the notes

// http://cote.cc/blog/logic-studio-9-midi-note-numbers
// keyNum 60 === C3 === Middle C
let keyNumOffset = 32 // to offset incorrect keyNum value on client
for (let i = 1; i <= 128; i++) {
  keyFrequency[i] = Math.pow(2, (i-49-keyNumOffset)/12) * 880
}

export function getFrequencyFromKeyNum(keyNum) {
  // Valid keyNum
  if (typeof keyNum === 'number' && keyNum >= 1 && keyNum <= 128)
    return keyFrequency[keyNum]

  // If we get to here - something wrong!
  throw new RangeError(`getFrequencyFromKeyNum(): Invalid KeyNum [${keyNum}]`)
}

export const BEATS_PER_BAR = 4 // For 4/4 time signature, it's 4
export const SECONDS_PER_MINUTE = 60

export function barToPlayTime(bar, engine) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  let playStartTime = engine.playStartTime || engine.ctx.currentTime

  return bar * BEATS_PER_BAR * SECONDS_PER_MINUTE / engine.lastState.phrase.present.tempo + playStartTime
}

export function playTimeToBar(time, engine) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  let playStartTime = engine.playStartTime || engine.ctx.currentTime

  return (time - playStartTime) / (BEATS_PER_BAR * SECONDS_PER_MINUTE) * engine.lastState.phrase.present.tempo
}
