import moment from 'moment'
import { phraseMidiSelector } from 'selectors/selectorTransport'
import toMidiFile from 'helpers/toMidiFile'
import { saveAs } from 'file-saver'

export const exportToMidi = () => {
  return (dispatch, getState) => {
    let state = getState()
    let { phraseMeta: { phraseName }, phrase: { present: { tempo }}} = state
    let notes = phraseMidiSelector(state)
    let formattedTime = moment().format(`L`).replace(/\//g, `-`)
    let filename = `${phraseName || `untitled_phrase`}_${formattedTime}`

    saveAs(toMidiFile({ notes, tempo }), `${filename}.mid`)
  }
}
