import React, { Component } from 'react'
import { connect } from 'react-redux'

import { api } from 'helpers/ajaxHelpers'

import { userRequestProfile } from 'reducers/reduceUserProfile'
import { addNotification, catchAndToastException } from 'reducers/reduceNotification'

export class UserProfilePic extends Component {
  state = {
    uploading: false,
  }

  render() {
    let image = null
    let { userId } = this.props
    let user
    if (userId) {
      user = this.props.users[userId]
      if (user && !user.pending)
        image = user.picture
    }

    let isLoading = this.state.uploading
    let bubble
    if (user && user.picture)
      bubble = <img src={image} />
    else if (user && user.username)
      bubble = <span className="user-profile-pic-initials">{ user.username.substring(0, 2).toUpperCase() }</span>
    else {
      isLoading = true
      bubble =
        <span className="user-profile-pic-loading fa fa-spinner fa-pulse fa-2x" />
    }

    let ownerStyle = this.props.isCurrentUser ? `user-profile-pic-owner` : ``

    return (
      <div className={`user-profile-pic ${ownerStyle}`} onClick={this.triggerDialog}>
        { bubble }
        { this.renderVerified() }
        { this.props.isCurrentUser && !isLoading && (
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
