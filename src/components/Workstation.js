import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Helmet from "react-helmet"
import iNoBounce from "inobounce"
iNoBounce.disable()

import diffProps from 'helpers/diffProps'
import { phrase, presence } from 'actions/actions'

import { arrangeToolSelect } from 'reducers/reduceArrangeTool'
import {
  phraseLoadFromDb,
  phraseLoadFinish,
  phraseNewPhrase,
  phraseLoginReminder,
  phraseRephraseReminder,
  phraseNotFound,
  phraseCreateTrack,
} from 'reducers/reducePhrase'
import { layoutConsoleSplit } from 'reducers/reduceNavigation'

import CursorProvider from 'components/CursorProvider.js'
import HotkeyProvider from 'components/HotkeyProvider'
import MouseEventProvider from 'components/MouseEventProvider'
import SamplesProgress from 'components/SamplesProgress'
import withSocket from 'components/withSocket'
import WorkstationHeader from 'components/WorkstationHeader'
// import WorkstationSplit from 'components/WorkstationSplit'
import WorkstationFooter from 'components/WorkstationFooter'
import Mixer from 'components/Mixer'
import TrackEditor from 'components/TrackEditor'
import Rack from 'components/Rack'
import Discussion from 'components/Discussion'
import terms from 'constants/terms'
import WorkstationMobileCompatibilityOverlay from 'components/WorkstationMobileCompatibilityOverlay'

export class Workstation extends Component {

  componentDidMount() {
    let {
      dispatch,
      loading,
      socket,
      route,
      router,
    } = this.props

    // Put the page into "app-mode" to prevent inertia scroll
    iNoBounce.enable()
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    socket.on(`reconnect`, () => {
      if (this.props.params.phraseId) {
        socket.emit(`client::joinRoom`, {
          phraseId: this.props.params.phraseId,
          username: this.props.currentUsername,
          userId: this.props.userId,
        })
      }
    })

    // Subscribe to socket updates for the lifetime of the component
    socket.on(`server::updatePhrase`, this.receiveSocketUpdate)

    socket.on(`server::updatePresence`, users => {
      dispatch({
        type: presence.UPDATE_USERS,
        payload: { users },
      })
    })

    socket.on(`server::privacySettingChanged`, socketData => {
      if (socketData.phraseId === this.props.params.phraseId) {
        dispatch({
          type: phrase.UPDATE_PRIVACY_SETTING,
          payload: { privacySetting: socketData.privacySetting },
        })

        // It's possible a user will get a link that's private, but is meant to be,
        // or will be public at some point in time. Let's automatically try to load
        // it for them if they are sitting with the `not found` messeage.

        /* TECHNICAL NOTE */

        // `notFound` must be referenced inside this socket handler.
        // If we destructure it at top with the rest of the props
        // `notFound` will always be the value at mounting time.

        if (this.props.notFound && socketData.privacySetting === terms.PUBLIC) {
          dispatch(phraseLoadFromDb(this.props.params.phraseId))

          socket.emit(`client::joinRoom`, {
            phraseId: this.props.params.phraseId,
            username: this.props.currentUsername,
            userId: this.props.userId,
          })
        }

        // This goes both ways.. if an observer is on a phrase that change to
        // private, they should no longer have access it, and see `Not found`.

        else if (
          socketData.privacySetting === terms.PRIVATE &&
          this.props.authorUsername !== this.props.currentUsername &&
          !this.props.collaborators.find(x => x === this.props.userId)
        ) {
          dispatch(phraseNotFound())
        }
      }
    })

    socket.on(`server::collaboratorAdded`, socketData => {
      if (socketData.phraseId === this.props.params.phraseId) {
        if (this.props.notFound) {
          dispatch(phraseLoadFromDb(this.props.params.phraseId))

          socket.emit(`client::joinRoom`, {
            phraseId: this.props.params.phraseId,
            username: this.props.currentUsername,
            userId: this.props.userId,
          })
        }

        dispatch({
          type: phrase.ADD_COLLABORATOR,
          payload: socketData,
        })
      }
    })

    socket.on(`server::collaboratorLeft`, socketData => {
      if (socketData.phraseId === this.props.params.phraseId) {
        if (socketData.privacySetting === `private` &&
          this.props.authorUsername !== this.props.currentUsername) {
          dispatch(phraseNotFound())
        }

        dispatch({
          type: phrase.REMOVE_COLLABORATOR,
          payload: { userId: socketData.userId },
        })
      }
    })

    socket.on(`server::masterControlChanged`, socketData => {
      if (socketData.phraseId === this.props.params.phraseId) {
        dispatch({
          type: phrase.GIVE_MASTER_CONTROL,
          payload: { userId: socketData.targetUserId },
        })
      }
    })

    // Load existing phrase from URL param
    if (this.props.params.phraseId) {
      if (loading !== phrase.REPHRASE) {
        dispatch(phraseLoadFromDb(this.props.params.phraseId))
      }

      socket.emit(`client::joinRoom`, {
        phraseId: this.props.params.phraseId,
        username: this.props.currentUsername,
        userId: this.props.userId,
      })
    }

    // Load brand new phrase
    else if (loading !== phrase.REPHRASE) {
      dispatch(phraseNewPhrase())
    }

    dispatch(arrangeToolSelect(`pointer`))

    // Set Leave Hook ("You have unsaved changes!")
    router.setRouteLeaveHook(route, this.leaveHook)
  }

  render() {
    // 404/403
    if (this.props.notFound) {
      return (
        <div className="workstation-background">
          <div className="workstation-container">
            <Helmet title={`Not found! - Phrase.fm`} />
            <div className="workstation-loading text-center">
              <p style={{ fontSize: `3rem` }}>¯\_(ツ)_/¯</p>
              <p style={{ marginTop: 15 }}>
                Phrase not found!
              </p>
              <p
                style={{ color: `#00FFFF`, cursor: `pointer`, textDecoration: `underline` }}
                onClick={() => this.props.dispatch(phraseNewPhrase())}
              >
                Click here to start a new Phrase
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Loading Screen
    if (this.props.loading) {
      let loadingMessage
      switch (this.props.loading) {
        default:
        case phrase.LOAD_START: loadingMessage = "Loading Phrase..."; break
        case phrase.REPHRASE:   loadingMessage = "Generating Rephrase..."; break
        case phrase.NEW_PHRASE: loadingMessage = "Loading blank Phrase..."; break
      }

      return (
        <div className="workstation-background">
          <div className="workstation-container">
            <Helmet title={`${loadingMessage} - Phrase.fm`} />
            <div className="workstation-loading text-center">
              <span className="fa fa-spinner fa-pulse fa-2x" />
              <p style={{ marginTop: 15 }}>
                { loadingMessage }
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Blank Phrase, choose track type screen
    if (!this.props.tracks.length) {
      let midiOptionStyle = {
        backgroundImage: `url(${require('../img/midi-track.png')})`
      }
      let audioOptionStyle = {
        backgroundImage: `url(${require('../img/audio-track.png')})`
      }
      return (
        <div className="workstation-background">
          <div className="workstation-container">
            <Helmet title={`New Phrase - Phrase.fm`} />
            <div className="workstation-loading text-center">
              <h2 style={{ marginBottom: 20 }}>
                Choosing a starting point:
              </h2>
              <div className="row">
                <div className="col-sm-6">
                  <div
                    className="workstation-option"
                    style={midiOptionStyle} onClick={this.createMidiTrack}
                  >
                    <h3>MIDI Track</h3>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div
                    className="workstation-option"
                    style={audioOptionStyle} onClick={this.createAudioTrack}
                  >
                    <h3>Audio Track</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    let rackProps = {
      rackOpen: this.props.rackOpen,
      track: this.props.selectedTrack,
    }

    let minimizeMixer = true//this.props.consoleSplitRatio < 0.2 && this.props.focusedTrack !== null
    let minimizeClipEditor = this.props.consoleSplitRatio > 0.8 || this.props.focusedTrack === null
    let footerProps = {
      dispatch: this.props.dispatch,
      consoleSplitRatio: this.props.consoleSplitRatio,
      focusedTrack: this.props.focusedTrack,
      rackOpen: this.props.rackOpen,
      openInputMethod: this.props.inputMethodsTour,
    }

    let isMidi = this.props.selectedTrack && this.props.selectedTrack.type !== "AUDIO"

    return (
      <CursorProvider>
        <HotkeyProvider midi={isMidi}>
          <MouseEventProvider>

            <div className="workstation-background">
              <div className="workstation-container">
                <WorkstationMobileCompatibilityOverlay />
                <div className="workstation workstation-maximized disable-select">
                  <div className="workstation-core" style={this.getCoreSplit()}>
                    <Helmet title={`${this.props.phraseName || `Untitled Phrase`} by ${this.props.authorUsername || this.props.currentUsername || `Unknown`} - Phrase.fm`} />
                    <WorkstationHeader />
                    <div className="workstation-body">
                      <Rack {...rackProps} />
                      <div className="workstation-main" style={this.getMainSplit()}>
                        <div className="workstation-mixer" style={this.getMixerSplit()}>
                          <Mixer minimized={minimizeMixer} maximize={() => this.setConsoleSplit(0.5)} />
                        </div>
                        {/*
                        <WorkstationSplit splitRatio={this.props.consoleSplitRatio} setRatio={this.setConsoleSplit} />
                        */}
                        <div className="workstation-clip" style={this.getClipSplit()}>
                          <TrackEditor
                            minimized={minimizeClipEditor} selectedTrack={this.props.selectedTrack}
                            maximize={() => this.setConsoleSplit(0.5)}
                          />
                        </div>
                      </div>
                      <WorkstationFooter {...footerProps} />
                    </div>
                  </div>
                  <Discussion open={this.props.discussionOpen} />
                </div>
              </div>
              <SamplesProgress samples={this.props.samples}/>
            </div>

          </MouseEventProvider>
        </HotkeyProvider>
      </CursorProvider>
    )
  }

  componentWillUnmount() {
    // Take the page back out of "app-mode"
    iNoBounce.disable()
    document.documentElement.style.overflow = "auto"
    document.body.style.overflow = "auto"

    this.props.socket.off("server::updatePhrase", this.receiveSocketUpdate)
  }

  componentWillReceiveProps(nextProps) {
    // Phrase ID Changed!
    if (nextProps.params.phraseId !== this.props.params.phraseId) {

      // Phrase changed because of autosaving new phrase - do not interrupt!
      if (nextProps.autosaving === "DO_NOT_RELOAD")
        return

      // Load existing phrase from URL param
      if (nextProps.params.phraseId)
        this.props.dispatch(phraseLoadFromDb(nextProps.params.phraseId))

      // New phrase - clear the slate if necessary
      else if (!nextProps.params.phraseId && nextProps.phraseId)
        this.props.dispatch(phraseNewPhrase())
    }
  }

  leaveHook = () => {
    let pristine = this.props.pristine
    let newPhrasePage = !this.props.params.phraseId

    let unsavedChanges = !pristine && this.props.autosaving !== "DO_NOT_RELOAD"
    if (unsavedChanges) {
      // Blur Search Box to inputs (https://phrasetechnologies.atlassian.net/browse/WEB-52)
      let searchBox = document.getElementById("header-search-input")
      if (searchBox)
        searchBox.blur()

      // Unlogged-in user, new phrase
      if (newPhrasePage) {
        this.props.dispatch(phraseLoginReminder({ show: true }))
        return "Your Phrase is not saved and changes will be lost."
      }

      // Modifying existing phrase, not with write permission
      else if (this.props.authorUsername !== this.props.currentUsername) {
        this.props.dispatch(phraseRephraseReminder({ show: true }))
        return "Your modifications to this Phrase are not saved and changes will be lost."
      }
    }

    // Nothing to discard, just leave
    return null
  }

  componentDidUpdate() {
    this.props.router.setRouteLeaveHook(this.props.route, this.leaveHook)
  }

  setConsoleSplit = (ratio) => {
    this.props.dispatch(layoutConsoleSplit(ratio))
    window.dispatchEvent(new Event('resize'))
  }

  receiveSocketUpdate = (loadedPhrase) => {
    // Only if it's the correct phrase!
    let correctPhrase = loadedPhrase.id === this.props.phraseId
    let ownerOfPhrase = loadedPhrase.masterControl.includes(this.props.userId)
    if (correctPhrase && !ownerOfPhrase) {
      this.props.dispatch(phraseLoadFinish({
        ignoreAutosave: true,
        retainNoteSelection: true,
        loadedPhrase,
      }))
    } else {
      console.warn(`Received redundant socket update for ${loadedPhrase.id}`)
    }
  }

  getMixerSplit() {
    if (this.props.focusedTrack === null) return { bottom: 0 }
    else if (this.props.consoleSplitRatio < 0.2) return { height: 0 }
    else if (this.props.consoleSplitRatio > 0.8) return { bottom: 0 }
    return { bottom: ((1 - this.props.consoleSplitRatio) * 100) + '%' }
  }

  getClipSplit() {
    if (this.props.focusedTrack === null) return { display: 'none' }
    else if (this.props.consoleSplitRatio < 0.2) return { top:    0 }
    else if (this.props.consoleSplitRatio > 0.8) return { height: 0 }
    return { top: (this.props.consoleSplitRatio  * 100) + '%' }
  }

  getMainSplit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    return { left: this.props.rackOpen ? 515 : 0 }
  }

  getCoreSplit() {
    return { right: this.props.discussionOpen ? 365 : 0 }
  }

  createMidiTrack = () => {
    this.props.dispatch(phraseCreateTrack({
      trackType: 'MIDI',
    }))
  }

  createAudioTrack = () => {
    this.props.dispatch(phraseCreateTrack({
      trackType: 'AUDIO',
    }))
  }

  shouldComponentUpdate(nextProps) {
    let shouldChange = diffProps(nextProps, this.props, [
      'loading',
      'notFound',
      'autosaving',
      'pristine',
      'phrase',
      'phraseId',
      'phraseName',
      'authorUsername',
      'collaborators',
      'focusedTrack',
      'consoleEmbedded',
      'consoleSplitRatio',
      'rackOpen',
      'selectedTrack',
      'samples',
      'inputMethodsTour',
    ])

    // Switch session connection
    if (nextProps.phraseId !== this.props.phraseId) {
      this.props.socket.emit(`disconnect`, { phraseId: this.props.phraseId })

      // Don't join the room again
      if (this.props.phraseId && nextProps.phraseId) {
        this.props.socket.emit(`client::joinRoom`, {
          phraseId: nextProps.phraseId,
          username: nextProps.currentUsername,
          userId: nextProps.userId,
        })
      }
    }

    // Ensure all canvases are re-rendered upon clip editor being shown
    if (Math.abs(this.props.consoleSplitRatio - nextProps.consoleSplitRatio) > 0.25) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0) // Some lifecycle methods are missed on the first event propogation due to race conditions
    }

    return shouldChange
  }
}

function mapStateToProps(state) {
  let selectedTrack = state.phrase.present.tracks.find(x => x.id === state.phraseMeta.trackSelectionID)

  return {
    loading: state.phraseMeta.loading,
    notFound: state.phraseMeta.notFound,
    autosaving: state.phraseMeta.saving,
    pristine: state.phraseMeta.pristine,
    phrase: state.phrase,
    phraseId: state.phraseMeta.phraseId,
    phraseName: state.phraseMeta.phraseName,
    authorUsername: state.phraseMeta.authorUsername,
    collaborators: state.phraseMeta.collaborators,
    currentUsername: state.auth.user.username,
    userId: state.auth.user.id,
    focusedTrack: state.pianoroll.currentTrack,
    consoleEmbedded:   state.navigation.consoleEmbedded,
    consoleSplitRatio: 0,//state.navigation.consoleSplitRatio,
    rackOpen: state.navigation.rackOpen,
    discussionOpen: state.navigation.discussionOpen,
    samples: state.samples,
    inputMethodsTour: state.navigation.inputMethodsTour,
    selectedTrack,
    tracks: state.phrase.present.tracks,
  }
}

export default withSocket(withRouter(connect(mapStateToProps)(Workstation)))
