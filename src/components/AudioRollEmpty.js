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

  updateProgress = (oEvent) => {
    if (oEvent.lengthComputable) {
      let percentComplete = (oEvent.loaded / oEvent.total) * 100
      this.setState({ percentComplete })
    }
  }

  uploadDone = (response) => {
    if (!response) {
      this.setState({ percentComplete: null })
      return
    }

    if (response.success) {
      this.props.dispatch(phraseCreateClip({
        trackID: this.props.currentTrack,
        start: 0,
        audioUrl: `${API_URL}/audio-tracks/${response.audioFile}`,
      }))
    } else {
      this.setState({ percentComplete: null })
      this.props.dispatch(addNotification({
        title: response.title,
        message: response.message,
      }))
    }
  }

  onDrop = async (files) => {
    if (!files || !files[0]) {
      this.props.dispatch(addNotification({
        title: `Please choose a file.`,
        message: ``,
      }))
      return
    }
    if (!this.props.phraseId) {
      await dispatch(librarySaveNew())
    }
    xhrApi({
      endpoint: `uploadTrackAudio`,
      body: {
        audioFile: files[0],
        phraseId: this.props.phraseId,
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
          <button className="btn btn-bright">
            <span className="fa fa-upload" />
            <span> Upload audio file</span>
          </button>
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
    currentTrack: state.pianoroll.currentTrack,
  }
}

export default connect(mapStateToProps)(AudioRollEmpty)
