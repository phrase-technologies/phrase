import React, { Component } from 'react'

import { transportPlayToggle,
         transportStop } from '../actions/actionsTransport.js'
import { phraseDeleteSelection } from '../actions/actionsPhrase.js'

// ============================================================================
// Hotkey Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides global hotkey handling (keyboard shortcuts)
//
// Unsure of whether or not this will conflict with forms...
export default class HotkeyProvider extends Component {

  render() {
    return this.props.children
  }

  constructor() {
    super()
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp   = this.handleKeyUp.bind(this)
    document.addEventListener("keydown", this.handleKeyDown)
    document.addEventListener("keyup",   this.handleKeyUp)
  }

  handleKeyDown(e) {
    // Prevent doublebooking events with form <inputs>
    if (e.target.tagName == "INPUT")
      return

    // Everything else, override!
    e.preventDefault()
  }

  handleKeyUp(e) {
    let dispatch = this.props.dispatch

    // Prevent doublebooking events with form <inputs>
    if (e.target.tagName == "INPUT")
      return

    // Everything else, override with custom hotkeys!
    e.preventDefault()
    switch(e.code) {
      case "Space":     dispatch(       transportPlayToggle() ); break;
      case "Delete":    dispatch(     phraseDeleteSelection() ); break;
    }
  }
}

HotkeyProvider.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}
