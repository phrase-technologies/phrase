import React, { Component } from 'react'
import { connect } from 'react-redux'

import MusicalTypingKey from 'components/MusicalTypingKey'
import diffProps from 'helpers/diffProps'

export class MusicalTyping extends Component {

  render() {
    let currentBase = this.props.currentOctave * 12

    return (
      <div className="musical-typing">
        <MusicalTypingKey keyInitial="A" color="white" keyNum={currentBase +  0} active={this.props.midiKeys[currentBase +  0]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="W" color="black" keyNum={currentBase +  1} active={this.props.midiKeys[currentBase +  1]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="S" color="white" keyNum={currentBase +  2} active={this.props.midiKeys[currentBase +  2]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="E" color="black" keyNum={currentBase +  3} active={this.props.midiKeys[currentBase +  3]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="D" color="white" keyNum={currentBase +  4} active={this.props.midiKeys[currentBase +  4]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="F" color="white" keyNum={currentBase +  5} active={this.props.midiKeys[currentBase +  5]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="T" color="black" keyNum={currentBase +  6} active={this.props.midiKeys[currentBase +  6]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="G" color="white" keyNum={currentBase +  7} active={this.props.midiKeys[currentBase +  7]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="Y" color="black" keyNum={currentBase +  8} active={this.props.midiKeys[currentBase +  8]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="H" color="white" keyNum={currentBase +  9} active={this.props.midiKeys[currentBase +  9]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="U" color="black" keyNum={currentBase + 10} active={this.props.midiKeys[currentBase + 10]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="J" color="white" keyNum={currentBase + 11} active={this.props.midiKeys[currentBase + 11]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="K" color="white" keyNum={currentBase + 12} active={this.props.midiKeys[currentBase + 12]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="O" color="black" keyNum={currentBase + 13} active={this.props.midiKeys[currentBase + 13]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="L" color="white" keyNum={currentBase + 14} active={this.props.midiKeys[currentBase + 14]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="P" color="black" keyNum={currentBase + 15} active={this.props.midiKeys[currentBase + 15]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial=";" color="white" keyNum={currentBase + 16} active={this.props.midiKeys[currentBase + 16]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="'" color="white" keyNum={currentBase + 17} active={this.props.midiKeys[currentBase + 17]} currentTrackID={this.props.currentTrackID} />
        <MusicalTypingKey keyInitial="Z" color="aqua"  active={false} />
        <MusicalTypingKey keyInitial="X" color="aqua"  active={false} />
        <div className="musical-typing-octave">Octave: C{this.props.currentOctave}</div>
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, [
      'currentTrackID',
      'midiKeys',
      'currentOctave',
    ])
  }

}

function mapStateToProps(state) {
  return {
    midiKeys: state.midi.keys,
    currentTrackID: state.pianoroll.currentTrack,
    currentOctave: state.midi.currentOctave,
  }
}

export default connect(mapStateToProps)(MusicalTyping)
