import Midi from 'jsmidgen'

let keyNumOffset = 32 // to offset incorrect keyNum value on client

// client time is 0.25 per quarter, jsmidgen uses 128 ticks per quarter
let tickMultiplier = 512 // 0.25 * 128

function getTimeFromBar (bar, previous) {
  return (bar - (previous ? previous.bar : 0)) * tickMultiplier
}

export default ({ notes, tempo }) => {
  // add notes to related track
  let tracks = notes.reduce((acc, note) => ({
    ...acc,
    [note.trackID]: [
      ...(acc[note.trackID] || []),
      {
        ...note,
        keyNum: note.keyNum + keyNumOffset,
        // note time needs to be # of ticks since last event
        time: getTimeFromBar(
          note.bar,
          acc[note.trackID] && acc[note.trackID][acc[note.trackID].length - 1]
        ),
      }
    ]
  }), {})

  let file = new Midi.File()

  Object.values(tracks).forEach(notes => {
    let track = new Midi.Track()

    track.setTempo(tempo)

    notes.forEach(note => {
      track[note.type](0, note.keyNum, note.time, note.velocity)
    })

    file.addTrack(track)
  })

  // create binary download blob

  let bytes = file.toBytes()
  let byteNumbers = bytes.split(``).map(x => x.charCodeAt(0))
  let byteArray = new Uint8Array(byteNumbers)
  let blob = new Blob([ byteArray ], { type: `application/octet-stream` })

  return blob
}
