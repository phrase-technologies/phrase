import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal'
import LaddaButton from 'react-ladda'
import path from 'path'

import { catchAndToastException } from 'reducers/reduceNotification'
import { modalClose } from 'reducers/reduceModal'
import { formDataApi } from 'helpers/ajaxHelpers'

export class UploadPhotoModal extends Component {
  state = {
    uploading: false,
    errorMessage: null,
  }

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
            <div className="form-group">
              <h4 className="text-center">Choose a profile photo</h4>
            </div>
            <div className="form-group">
              <input className="form-control" type="file" ref={(ref) => this.profilePhoto = ref} />
            </div>
            <div className="form-group">
              <p className="text-danger text-center" style={{ marginTop: 5, marginBottom: 0 }}>
                { this.state.errorMessage }
              </p>
            </div>
            <LaddaButton
              className="btn btn-block btn-dark" buttonStyle="zoom-in"
              loading={this.state.uploading} onClick={this.uploadPhoto}
            >
              Upload Photo
            </LaddaButton>
          </div>
        </Modal.Body>
      </Modal>
    )
  }

  uploadPhoto = async () => {
    this.setState({ uploading: true })
    let photo = this.profilePhoto.files[0]
    if (!photo) {
      this.setState({ errorMessage: `Please select a photo.` })
    } else {
      let ext = path.extname(photo.name)
      if (!['.jpg', '.jpeg', '.gif', '.png'].includes(ext)) {
        this.setState({ errorMessage: `Invalid file type, please upload an image file.` })
      }
      else if (photo.size > 1000000) {
        this.setState({ errorMessage: `File is too large, please select a file under 1Mb` })
      } else {
        let self = this
        let formData = new FormData()
        formData.append('profilePhoto', photo, photo.name)
        formData.append('token', localStorage.token)
        catchAndToastException({
          dispatch: this.props.dispatch,
          toCatch: async () => {
            let response = await formDataApi({
              endpoint: `uploadProfilePic`,
              formData,
            })
            if (response.success) self.closeModal()
            else self.setState({ errorMessage: response.message})
          }
        })
      }
    }
    this.setState({ uploading: false })
  }

  closeModal = () => {
    this.props.dispatch(modalClose())
  }
}

export default connect()(UploadPhotoModal)
