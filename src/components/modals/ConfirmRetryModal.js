import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'

import { retryConfirmUser } from 'reducers/reduceAuth'
import { modalOpen, modalClose } from 'reducers/reduceModal'

export class ConfirmRetryModal extends Component {
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
            <h4 className="text-center">Didnt get the email?</h4>
          </div>
          <form onSubmit={this.submit} noValidate>
            <div className="form-group" style={{marginBottom: 10}}>
              <input
                className="form-control" type="email" autoComplete
                placeholder="Email" ref={(ref) => this.email = ref}
              />
              <p className="text-danger text-center">
                {this.props.errorMessage}
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.props.requestingAuth} type="submit"
            >
              Reset Password
            </LaddaButton>
          </form>
        </Modal.Body>
      </Modal>
    )
  }

  submit = (e) => {
    e.preventDefault()

    this.props.dispatch(retryConfirmUser({
      email: this.email.value,
    }))
  }

  openLoginModal = (e) => {
    e.preventDefault()
    this.props.dispatch(modalOpen({ modalComponent: `LoginModal` }))
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

export default connect(mapStateToProps)(ConfirmRetryModal)
