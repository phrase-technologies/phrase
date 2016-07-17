import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import { forgotPassword } from '../../reducers/reduceAuth.js'
import { modalOpen, modalClose } from '../../reducers/reduceModal.js'

export class ForgotPasswordModal extends Component {
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
            <h4 className="text-center">Need a new password?</h4>
          </div>
          <form onSubmit={this.submit} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email" autoComplete
                placeholder="Email" ref={(ref) => this.email = ref}
              />
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Reset Password
            </LaddaButton>
            <p className="text-danger text-center" style={{ marginTop: 5, marginBottom: 0 }}>
              {this.props.errorMessage}
            </p>
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

    this.props.dispatch(forgotPassword({
      email: this.email.value,
    }))
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

  openLoginModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'LoginModal'  }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(ForgotPasswordModal)