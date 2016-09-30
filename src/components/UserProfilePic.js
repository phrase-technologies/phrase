import React, { Component } from 'react'
import { connect } from 'react-redux'

import { api } from 'helpers/ajaxHelpers'
import { defaultPic } from 'helpers/authHelpers'

import { userRequestProfile } from 'reducers/reduceUserProfile'
import { addNotification, catchAndToastException } from 'reducers/reduceNotification'

export class UserProfilePic extends Component {
  state = {
    uploading: false,
  }

  render() {
    let image = null
    let { userId } = this.props
    if (userId) {
      let u = this.props.users[userId]
      if (u && !u.pending)
        image = u.picture ? u.picture : defaultPic
    }
    let ownerStyle = this.props.isCurrentUser ? `user-profile-pic-owner` : ``
    return (
      <div className={`user-profile-pic ${ownerStyle}`} onClick={this.triggerDialog}>
        <img src={image} />
        { this.renderVerified() }
        { this.props.isCurrentUser && (
          <div className="user-profile-upload">
            <span className="fa fa-camera" />
            <span> Upload</span>
            <input
              type="file"
              style={{ display: 'none' }}
              ref={ref => this.uploadInput = ref }
              onChange={this.uploadPhoto}
            />
          </div>
        )}
      </div>
    )
  }

  renderVerified() {
    let user = this.props.users[this.props.userId]
    if (!user || !user.verified)
      return null

    return (
      <span className="fa fa-check user-profile-pic-verified" />
    )
  }

  triggerDialog = () => {
    if (this.props.isCurrentUser)
      this.uploadInput.click()
  }

  uploadPhoto = async () => {
    this.setState({ uploading: true })
    let { dispatch } = this.props
    let photo = this.uploadInput.files[0]
    if (!photo) {
      dispatch(addNotification({ title: `Please select a photo.`, message: `` }))
      this.setState({ uploading: false })
    } else {
      if (photo.size > 1000000) {
        dispatch(addNotification({ title: `File is too large`, message: `Please select a file under 1Mb` }))
        this.setState({ uploading: false })
      } else {
        let self = this
        let fileReader = new FileReader()
        let img = new Image()
        let _URL = window.URL || window.webkitURL
        img.src = _URL.createObjectURL(photo)

        fileReader.onload = (event) => {
          let dataUrl = event.target.result
          catchAndToastException({
            dispatch,
            toCatch: async () => {
              let response = await api({
                endpoint: `uploadProfilePic`,
                body: { base64: dataUrl },
              })
              if (response.success)
                dispatch(userRequestProfile({ userId: this.props.userId }))
              else
                dispatch(addNotification(response))
              self.setState({ uploading: false })
            },
            callback: () => { self.setState({ uploading: false }) }
          })
        }
        fileReader.readAsDataURL(photo)
      }
    }
  }
}
export default connect(state => ({ users: state.userProfile.users }))(UserProfilePic)
