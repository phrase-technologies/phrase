import React from 'react'

import Pianoroll from 'components/Pianoroll.js'
import AudioRoll from 'components/AudioRoll.js'

export default (props) => {
  let RollComponent = props.selectedTrack.type === "AUDIO"
    ? AudioRoll
    : Pianoroll

  return (
    <RollComponent minimized={props.minimized} maximize={props.maximize} />
  )
}
