import React from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'

import { modalClose } from 'reducers/reduceModal'

let SavePhraseModal = ({ dispatch, show }) =>
  <Modal
    bsSize="small"
    show={show}
    onHide={() => dispatch(modalClose())}
  >
    <Modal.Body>
      Yo
    </Modal.Body>
  </Modal>

export default connect()(SavePhraseModal)
