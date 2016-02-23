import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { phraseArmTrack } from '../actions/actionsPhrase.js'

export default class MixerTrackArm extends Component {

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
    this.props.dispatch( phraseArmTrack(this.props.trackID) )
  }

  render() {
    var buttonClasses = "mixer-track-btn mixer-track-arm"
        buttonClasses += this.props.arm ? " active" : ""

    return (
      <button className={buttonClasses}>
        <span className="fa fa-circle" />
      </button>
    )
  }
}

MixerTrackArm.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  trackID:      React.PropTypes.number.isRequired,
  arm:          React.PropTypes.bool
}
