// ============================================================================
// MIDI TRIGGERS
// ============================================================================
// This triggers can be used to schedule sounds at:
// a) Specific timestamps relative to the AudioContext (i.e. engine.ctx)
// b) In real-time, if time is ommitted
const keyFrequency = {} // Set the frequencies for the notes
for (var i = 1; i <= 88; i++)
  keyFrequency[i] = Math.pow(2, (i-49)/12) * 440

export function getFrequencyFromKeyNum(keyNum) {
  // Valid keyNum
  if (typeof keyNum == 'number' && keyNum >= 1 && keyNum <= 88)
    return keyFrequency[keyNum]

  // If we get to hear - something wrong!
  throw new RangeError(`getFrequencyFromKeyNum(): Invalid KeyNum [${keyNum}]`)
}