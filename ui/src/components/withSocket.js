import React, { PropTypes } from 'react'

export default function withSocket(ChildComponent) {

  let SocketedComponent = (props, context) => {
    return <ChildComponent {...props} socket={context.socket} />
  }

  SocketedComponent.contextTypes = {
    socket: PropTypes.object,
  }

  return SocketedComponent

}
