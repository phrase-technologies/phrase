import { Component, Children, PropTypes } from 'react'

// ============================================================================
// Socket Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides socket singleton to any component that needs it via
// React context and the withSocket higher order component helper.
//
export default class SocketProvider extends Component {

  render() {
    return Children.only(this.props.children)
  }

  getChildContext() {
    return { socket: this.props.socket }
  }

}

SocketProvider.childContextTypes = {
  socket: PropTypes.object,
}
