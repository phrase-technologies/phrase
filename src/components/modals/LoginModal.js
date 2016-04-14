import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import { login } from '../../reducers/reduceAuth.js'
import { modalOpen, modalClose } from '../../reducers/reduceModal.js'

export class LoginModal extends Component {
  render() {
    return (
      <Modal
        bsSize="small"
        show={this.props.show}
        onHide={this.closeModal}
      >
        <Modal.Body>
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          <div className="form-group">
            <h4 className="text-center">Have an account?</h4>
          </div>
          <form onSubmit={this.login} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email"
                placeholder="Email or Username" ref={(ref) => this.email = ref}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
              />
              <p className="text-right">
                <a><small>Forgot Password</small></a>
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Log in
            </LaddaButton>
            <p className="text-danger text-center" style={{marginTop:5}}>
              {this.props.errorMessage}
            </p>
          </form>
          <p className="text-center">
            <span>New to Phrase? </span>
            <a href="" onClick={this.openSignupModal}>
              <strong>Sign up</strong>
            </a>
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

  openSignupModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'SignupModal'  }))
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(LoginModal)
