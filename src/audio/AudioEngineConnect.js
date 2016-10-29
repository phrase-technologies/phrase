import React, { Component } from 'react'

import engineShape from './AudioEnginePropTypes.js'

// ============================================================================
// ENGINE PROVIDER
// ============================================================================
// Makes the AudioEngine available to all React Components via the `context`
// trick. Inspired by the `react-redux` store <Provider>.
//
// See AudioEngineConnect.js for how to access the AudioEngine from components.
export default function connectEngine(ChildComponent) {

  return class extends Component {

    render() {
      return (
        <ChildComponent {...this.props} ENGINE={this.engine} />
      )
    }

    constructor(props, context) {
      super(props, context)
      this.engine = props.engine || context.engine
    }

    static contextTypes = {
      engine: engineShape.isRequired,
    }

  }

}
