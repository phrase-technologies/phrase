import React, { Component } from 'react'

import engineShape from './AudioEnginePropTypes.js'

// ============================================================================
// ENGINE PROVIDER
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
// 
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default class EngineProvider extends Component {
  render() {
    return React.Children.only(this.props.children)
  }

  constructor(props, context) {
    super(props, context)
    this.engine = props.engine
  }

  getChildContext() {
    return { engine: this.engine }
  }
}

EngineProvider.propTypes = {
  engine:   engineShape.isRequired,
  children: React.PropTypes.element.isRequired
}
EngineProvider.childContextTypes = {
  engine:   engineShape.isRequired
}

