import Midi from 'jsmidgen'

export default ({ notes, tempo }) => {

  // flatten client notes into individual on / off events
  // could do sorting, time correcting here as well..

  notes = notes
    .reduce((acc, note) => ([
      ...acc,
        {
          time: note.start,
          type: `addNoteOn`,
          keyNum: note.keyNum,
        },
        {
          time: note.end,
          type: `addNoteOff`,
          keyNum: note.keyNum,
        },
    ]), [])

    // sort from start to finish
    .sort((a, b) => a.time - b.time)

  // note time needs to be # of ticks since last event
  notes = notes.map((note, i) => ({
    ...note,
    time: note.time - (notes[i - 1] ? notes[i - 1].time : 0),
  }))

  let file = new Midi.File()
  let track = new Midi.Track()

  track.setTempo(tempo)
  file.addTrack(track)

  let keyNumOffset = 32 // to offset incorrect keyNum value on client

  // client time is 0.25 per quarter, jsmidgen uses 128 ticks per quarter
  let tickMultiplier = 512 // 0.25 * 128

  notes.forEach(note => {
    track[note.type](0, note.keyNum + keyNumOffset, note.time * tickMultiplier)
  })

  // create binary download blob

  let bytes = file.toBytes()
  let byteNumbers = bytes.split(``).map(x => x.charCodeAt(0))
  let byteArray = new Uint8Array(byteNumbers)
  let blob = new Blob([ byteArray ], { type: `application/octet-stream` })

  return blob
}
