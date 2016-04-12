import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'

import { login, signup } from '../reducers/reduceAuth.js'

export class AuthenticationModal extends Component {
  render() {
    let mainHeading = this.props.returningUser ? 'Have an account?' : 'Join Phrase Today.'
    let mainButton = this.props.returningUser ? 'Log in' : 'Sign up'
    let alternateHeading = this.props.returningUser ? 'New to Phrase?' : 'Already have an account?'
    let alternateButton = this.props.returningUser ? 'Sign up' : 'Log in'
    let loadingIcon = this.props.requestingAuth ? '<span>...</span>' : null

    return (
      <Modal
        bsSize="small"
        show={true}
        onHide={this.closeModal}
      >
        <Modal.Body>
          <button type="button" className="close">&times;</button>
          <div className="form-group">
            <h4 className="text-center">{mainHeading}</h4>
          </div>
          <form onSubmit={e => this.login(e) }>
            <div className="form-group">
              <input
                className="form-control" type="email"
                placeholder="Email"  ref={(ref) => this.email = ref}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
              />
            </div>
            <button className="btn btn-block btn-dark" type="submit">
              {mainButton}
              {loadingIcon}
            </button>
          </form>
          <br/>
          <p className="text-center">
            <span>{alternateHeading} </span>
            <a><strong>{alternateButton}</strong></a>
          </p>
        </Modal.Body>
      </Modal>
    )
  }

  login = (e) => {
    e.preventDefault()

    this.props.dispatch(login({
      email: this.email.value,
      password: this.password.value,
    }))
  }

  closeModal() {
    // this.props.dispatch()
  }
}

AuthenticationModal.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  requestingAuth: React.PropTypes.bool.isRequired,
}

export default connect()(AuthenticationModal)
