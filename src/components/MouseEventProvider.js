import { Component } from 'react'
import { connect } from 'react-redux'
import { mouse } from 'actions/actions'

class MouseEventProvider extends Component {
  componentDidMount() {
    window.onmousemove = event => this.props.dispatch({
      type: mouse.UPDATE,
      payload: event,
    })
  }

  render() {
    return this.props.children
  }
}

export default connect()(MouseEventProvider)
