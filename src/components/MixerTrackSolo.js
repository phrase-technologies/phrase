import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { phraseSoloTrack } from '../actions/actionsPhrase.js'

export default class MixerTrackSolo extends Component {

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
    this.props.dispatch( phraseSoloTrack(this.props.trackID) )
  }

  render() {
    var buttonClasses = "mixer-track-btn mixer-track-solo"
        buttonClasses += this.props.solo ? " active" : ""

    return (
      <button className={buttonClasses}>
        <span>S</span>
      </button>
    )
  }
}

MixerTrackSolo.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  trackID:      React.PropTypes.number.isRequired,
  solo:         React.PropTypes.bool
}
