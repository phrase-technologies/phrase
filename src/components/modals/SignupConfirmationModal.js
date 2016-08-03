import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'

import { modalClose } from 'reducers/reduceModal'

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
          <p>We sent a confirmation email to {this.props.email}, please follow the link in the email to complete the registration process</p>
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

  closeModal = () => {
    this.props.dispatch(modalClose())
  }

  resendConfirmationEmail = (e) => {
    e.preventDefault()
    console.log(`TODO: implement support for resending a confirmation email`)
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(SignupConfirmationModal)
