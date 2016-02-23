import React, { Component } from 'react';

import { transportPlay,
         transportStop } from '../actions/actionsTransport.js';

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
    this.handleKey = this.handleKey.bind(this)
    document.addEventListener("keyup", this.handleKey)
  }

  handleKey(e) {
    let dispatch = this.props.dispatch

    // Prevent doublebooking events with form <inputs>
    if (e.target.tagName == "INPUT")
      return

    // Everything else, override with custom hotkeys!
    e.preventDefault()
    switch(e.code) {
      case "Space": dispatch( transportPlay() )
    }
  }
}

HotkeyProvider.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}
