import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import { newPassword } from '../../reducers/reduceAuth.js'
import { modalOpen, modalClose } from '../../reducers/reduceModal.js'

export class NewPasswordModal extends Component {
  constructor() {
    super()
    this.state = {
      emailError: null,
      passwordError: null,
      confirmPasswordError: null,
    }
  }

  render() {
    let passwordGroupClass = `form-group ${this.state.passwordError ? ' has-error' : ''}`
    let confirmPasswordGroupClass = `form-group ${this.state.confirmPasswordError ? ' has-error' : ''}`
    let errorStyle = { fontSize: 12, marginTop: 3, lineHeight: 1 }

    return (
      <Modal
        bsSize="small"
        show={this.props.show}
        onHide={this.closeModal}
      >
        <Modal.Body>
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          <div className="form-group">
            <h4 className="text-center">Set a new password</h4>
          </div>
          <form onSubmit={this.submit} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email" autoComplete
                placeholder="Email" ref={(ref) => this.email = ref}
              />
            </div>
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.emailError}
              </p>
            <div className={passwordGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="password"
                placeholder="Password" ref={(ref) => this.password = ref}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.passwordError}
              </p>
            </div>
            <div className={confirmPasswordGroupClass} style={{marginBottom: 10}}>
              <input
                className="form-control" type="password"
                placeholder="Confirm Password" ref={(ref) => this.confirmPassword = ref}
              />
              <p className="text-danger text-right" style={errorStyle}>
                {this.state.confirmPasswordError}
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Save Password
            </LaddaButton>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>Back to login? </span>
            <a href="" onClick={this.openLoginModal}>
              <strong>Login</strong>
            </a>
          </p>
        </Modal.Footer>
      </Modal>
    )
  }  

  submit = (e) => {
    e.preventDefault()

    this.props.dispatch(newPassword({
      email: this.email.value,
      resetToken: this.props.resetToken,
      password: this.password.value,
      confirmPassword: this.confirmPassword.value
    }))
  }

  componentWillReceiveProps(nextProps) {
    this.setState( {emailError: null, passwordError: null, confirmPasswordError: null} )
    if (nextProps.errorMessage)
      this.setState(nextProps.errorMessage)
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

  openLoginModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'LoginModal' }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(NewPasswordModal)