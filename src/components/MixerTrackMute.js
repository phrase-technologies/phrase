import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { phraseMuteTrack } from '../actions/actionsPhrase.js'

export default class MixerTrackMute extends Component {

  constructor() {
    super(...arguments)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this);
    this.container.addEventListener("click", this.handleClick)
  }

  componentWillUnmount() {
    this.container.removeEventListener("click", this.handleClick)
  }

  handleClick(e) {
    this.props.dispatch( phraseMuteTrack(this.props.trackID) )
  }

  render() {
    var buttonClasses = "mixer-track-btn mixer-track-mute"
        buttonClasses += this.props.mute ? " active" : ""

    return (
      <button className={buttonClasses}>
        <span>M</span>
      </button>
    )
  }
}

MixerTrackMute.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  trackID:      React.PropTypes.number.isRequired,
  mute:         React.PropTypes.bool
}
