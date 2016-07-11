import { Component } from 'react'
import { connect } from 'react-redux'
import { mouse } from 'actions/actions'

class MouseEventProvider extends Component {
  componentDidMount() {
    window.addEventListener('mousemove', event =>
      this.props.dispatch({
        type: mouse.UPDATE,
        payload: event,
      })
    )

    window.addEventListener('mouseup', () => {
      // pointer should unlock on any mouseup Event
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock
      document.exitPointerLock()
    })
  }

  render() {
    return this.props.children
  }
}

export default connect()(MouseEventProvider)
