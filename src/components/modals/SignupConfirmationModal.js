import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import { manualConfirmUser } from 'reducers/reduceAuth'
import { modalOpen, modalClose } from 'reducers/reduceModal'

export class SignupConfirmationModal extends Component {
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
            <h4 className="text-center">Thank you for signing up!</h4>
          </div>
          <p>
            <span>We sent a confirmation code to
              {this.props.email ? <strong> {this.props.email}</strong> : ` your email address`}.&nbsp;
            </span>
            Please enter the confirmation code below
          </p>
          <form onSubmit={this.submit} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="confirmToken" autoComplete
                placeholder="Confirmation Code" ref={(ref) => this.confirmToken = ref}
              />
              <p className="text-danger text-center">
                {this.props.errorMessage}
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Confirm
            </LaddaButton>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>Didn't get the email? </span>
            <a href="" onClick={this.resendConfirmationEmail}>
              <strong>Try Again</strong>
            </a>
          </p>
        </Modal.Footer>
      </Modal>
    )
  }

  submit = (e) => {
    e.preventDefault()
    this.props.dispatch(manualConfirmUser({
      email: this.props.email,
      confirmToken: this.confirmToken.value,
    }))
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

  resendConfirmationEmail = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: `ConfirmRetryModal`, payload: this.props.email }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(SignupConfirmationModal)
