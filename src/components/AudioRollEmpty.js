import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'
import { Line } from 'rc-progress'

import { xhrApi } from 'helpers/ajaxHelpers'

import { addNotification } from 'reducers/reduceNotification'
import { phraseCreateClip } from 'reducers/reducePhrase'

export class AudioRollEmpty extends Component {
  state = {
    percentComplete: null,
  }

  constructor() {
    super()
    this.onDrop = this.onDrop.bind(this)
    this.updateProgress = this.updateProgress.bind(this)
    this.uploadDone = this.uploadDone.bind(this)
  }

  updateProgress (oEvent) {
    if (oEvent.lengthComputable) {
      let percentComplete = (oEvent.loaded / oEvent.total) * 100
      this.setState({ percentComplete })
    } else {
      console.log(oEvent)
    }
  }

  uploadDone (response) {
    if (response.success) {
      this.props.dispatch(phraseCreateClip({
        trackID: this.props.currentTrack,
        start: 0,
        audioUrl: `${API_URL}/audio-tracks/${response.audioFile}`,
      }))
    } else {
      console.log(response)
    }
  }

  onDrop = async (files) => {
    let fileTypes = [ `mp3` ]
    if (!files || !files[0]) {
      this.props.dispatch(addNotification({
        title: `Please choose a file.`,
        message: ``,
      }))
      return
    }
    let file = files[0]
    let type = file.type.replace(`audio/`, ``)

    if (!file.type.includes(`audio/`) || !fileTypes.includes(type)) {
      this.props.dispatch(addNotification({
        title: `Invalid file type`,
        message: `Please choose one of the following: ${fileTypes.join(`,`)}`,
      }))
      return
    }

    if (!this.props.phraseId) {
      await dispatch(librarySaveNew())
    }

    // TODO: create the clip like anson said to
    let clipId = 0

    await xhrApi({
      endpoint: `uploadTrackAudio`,
      body: {
        audioFile: file,
        phraseId: this.props.phraseId,
        clipId,
        authorId: this.props.authorId,
      },
      onProgress: this.updateProgress,
      onLoad: this.uploadDone,
      dispatch: this.props.dispatch,
    })
  }

  render = () => {
    if (this.state.percentComplete !== null) {
      return (
        <div className="audioroll-empty">
          <div className="text-center">
            <p>
              Upload Progress:
            </p>
            <Line
              percent={this.state.percentComplete}
              strokeWidth="4"
              strokeColor="cyan"
              style={{width: 500, height: 10}}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="audioroll-empty">
        <div className="text-center">
          <label className="btn btn-bright" htmlFor="upload-input">
            <span className="fa fa-upload" />
            <span> Upload audio file</span>
          </label>
          <p style={{ marginTop: 10 }}>
            Or Drag and Drop into this box
          </p>
        </div>
        <Dropzone
          className="dropzone"
          activeClassName="dropzone-active"
          accept="audio/*"
          onDrop={this.onDrop}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    phraseId: state.phraseMeta.phraseId,
    authorId: state.phraseMeta.userId,
    currentTrack: state.pianoroll.currentTrack,
  }
}

export default connect(mapStateToProps)(AudioRollEmpty)
