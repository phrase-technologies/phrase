import React, { Component } from 'react'
import Modal from 'react-bootstrap/lib/Modal'

export default class MobileCompatibilityOverlay extends Component {
	render() {
		let modalProps = {
			show: true,
			container: this
		}

		return (
			<div id="mobile-compatibility-overlay">
				<Modal  {...modalProps}>
					<Modal.Header>
						<Modal.Title>Mobile compatibility coming soon!</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Please visit Phrase.fm from a desktop browser for the full experience
					</Modal.Body>
				</Modal>
			</div>
		)
	}
}