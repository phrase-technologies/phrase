import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'

import { modalOpen, modalClose } from '../../reducers/reduceModal.js'

export class ForgotPasswordSuccessModal extends Component {
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
            <h4 className="text-center">Email sent!</h4>
          </div>
          <p>We sent a message to {this.props.email} so you can set a new password</p>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>Didn't get the email? </span>
            <a href="" onClick={this.openForgotPasswordModal}>
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

  openForgotPasswordModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: 'ForgotPasswordModal'  }))
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(ForgotPasswordSuccessModal)
