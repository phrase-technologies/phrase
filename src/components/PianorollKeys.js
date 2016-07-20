import React, { Component } from 'react'

import PianorollKeyboardKey from './PianorollKeyboardKey.js'
import diffProps from 'helpers/diffProps'

export default class PianorollKeys extends Component {

  render() {
    let octave = 8
    let octaves = []
    let keys = []
    for (let key = 88; key > 0; key--) {
      // Specific sequence of black and white keys
      let keyClass = 'pianoroll-key'
          keyClass += (key % 12 in {2:true, 0:true, 10: true, 7: true, 5: true}) ? ' black' : ' white'
          keyClass += (key % 12 in {2:true,  7:true}) ? ' higher' : ''
          keyClass += (key % 12 in {10:true, 5:true}) ? ' lower' : ''
          keyClass += (key % 12 in {6:true}) ? ' thinner' : ''
      let keyLabel =  {1:'A', 11:'G', 9:'F', 8:'E', 6:'D', 4:'C', 3:'B'}[ key%12 ]
          keyLabel = keyLabel ? (keyLabel + octave) : null

      keys.push(
        <PianorollKeyboardKey
          key={key}
          currentTrack={this.props.currentTrack}
          keyNum={key}
          keyClass={keyClass}
          keyLabel={keyLabel}
        />
      )

      // Next keys into octave Group
      if (key % 12 === 4 || key === 1) {
        // Add Octave Label for full octaves
        let label = 'C' + octave
        keys.unshift(<div className="pianoroll-octave-label" key={label}><div>{label}</div></div>)
        octaves.push(<div className="pianoroll-octave" key={octave}>{keys}</div>)
        keys = []
        octave--
      }
    }
    return (
      <div className="pianoroll-keys-wrapper">
        { octaves }
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, ['currentTrack'])
  }

}
