import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'

import { modalOpen, modalClose } from 'reducers/reduceModal'

export class ConfirmSuccessModal extends Component {
  render() {
    return (
      <Modal
        bsSize="small"
        show={this.props.show}
        onHide={this.closeModal}
      >
        <Modal.Body>
          <button type="button" className="close" onClick={this.closeModal}>&times;</button>
          <div>
            <h4 className="text-center">You are all set, enjoy!</h4>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-center">
            <span>Please click </span>
            <a href="" onClick={this.openLoginModal}>
              <strong>here </strong>
            </a>
            <span> to login</span>
          </p>
        </Modal.Footer>
      </Modal>
    )
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

export default connect(mapStateToProps)(ConfirmSuccessModal)
