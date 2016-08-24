import { Component, Children, PropTypes } from 'react'
import { connect } from 'react-redux'
import { phrase } from 'actions/actions'

class SocketProvider extends Component {
  render() {
    return Children.only(this.props.children)
  }

  constructor(props, context) {
    super(props, context)
    let { socket, dispatch } = props

    socket.on(`server::updatePhrase`, loadedPhrase => {
      dispatch({
        type: phrase.LOAD_FINISH,
        ignoreAutosave: true,
        retainNoteSelection: true,
        payload: {
          parentId: loadedPhrase.parentId,
          id: loadedPhrase.id,
          name: loadedPhrase.phrasename,
          username: loadedPhrase.username,
          dateCreated: loadedPhrase.dateCreated,
          dateModified: loadedPhrase.dateModified,
          state: loadedPhrase.state,
        }
      })
    })
  }

  getChildContext() {
    return { socket: this.props.socket }
  }
}

SocketProvider.childContextTypes = {
  socket: PropTypes.object,
}

export default connect()(SocketProvider)
