import React, { Component } from 'react'
import Modal from 'react-bootstrap/lib/Modal'

export default class WorkstationMobileCompatibilityOverlay extends Component {
  render() {
    let modalProps = {
      show: true,
      container: this
    }

    return (
      <div id="workstation-mobile-compatibility-overlay">
        <Modal {...modalProps}>
          <Modal.Header>
            <Modal.Title>Notice!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Mobile/Tablet Compatibility coming soon.</p>
            <p>Please visit phrase.fm from a desktop browser for the full experience!</p>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}