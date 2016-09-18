import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Helmet from "react-helmet"

import diffProps from 'helpers/diffProps'
import { phrase } from 'actions/actions'

import {
  phraseLoadFromDb,
  phraseNewPhrase,
  phraseLoginReminder,
  phraseRephraseReminder,
} from 'reducers/reducePhrase'

import { layoutConsoleSplit } from 'reducers/reduceNavigation'

import CursorProvider from 'components/CursorProvider.js'
import HotkeyProvider from 'components/HotkeyProvider'
import MouseEventProvider from 'components/MouseEventProvider'
import SamplesProgress from 'components/SamplesProgress'
import withSocket from 'components/withSocket'

import WorkstationHeader from 'components/WorkstationHeader'
import WorkstationSplit from 'components/WorkstationSplit'
import WorkstationFooter from 'components/WorkstationFooter'
import Mixer from 'components/Mixer'
import Pianoroll from 'components/Pianoroll'
import Rack from 'components/Rack'
import Discussion from 'components/Discussion'

export class Workstation extends Component {

  componentDidMount() {
    let { dispatch, params, loading, socket, route, router } = this.props
    let { phraseId } = params

    // Put the page into "app-mode" to prevent inertia scroll
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    // Subscribe to socket updates for the lifetime of the component
    socket.on(`server::updatePhrase`, this.receiveSocketUpdate)
    socket.on(`server::updatePresence`, room => console.log("ROOM:", room))
    socket.on(`server::privacySettingChanged`, socketData => {
      if (socketData.phraseId === phraseId) {
        dispatch({
          type: phrase.UPDATE_PRIVACY_SETTING,
          payload: { privacySetting: socketData.privacySetting },
        })
      }
    })

    // Load existing phrase from URL param
    if (params.phraseId) {
      if (loading !== phrase.REPHRASE)
        dispatch(phraseLoadFromDb(phraseId))

      socket.emit(`client::joinRoom`, {
        phraseId,
        username: this.props.currentUsername
      })
    }

    // Load brand new phrase
    else if (loading !== phrase.REPHRASE) {
      dispatch(phraseNewPhrase())
    }

    // Set Leave Hook ("You have unsaved changes!")
    router.setRouteLeaveHook(route, this.leaveHook)
  }

  render() {
    // Drag and drop
    if (0) {
      return (
        <div className="workstation workstation-maximized disable-select text-center workstation-drop-target">
          <div className="workstation-loading text-center">
            <span className="fa fa-download fa-3x" />
            <p style={{ marginTop: 15 }}>
              Drag and drop any MIDI file (.mid)
            </p>
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
              <span className="fa fa-music fa-2x" />
              <p style={{ marginTop: 15 }}>
                { loadingMessage }
              </p>
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

    return (
      <CursorProvider>
        <HotkeyProvider>
          <MouseEventProvider>

            <div className="workstation-background">
              <div className="workstation-container">
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
                          <Pianoroll minimized={minimizeClipEditor} maximize={() => this.setConsoleSplit(0.5)} />
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
    let ownerOfPhrase = this.props.authorUsername === this.props.currentUsername
    if (correctPhrase && !ownerOfPhrase) {
      this.props.dispatch({
        type: phrase.LOAD_FINISH,
        ignoreAutosave: true,
        retainNoteSelection: true,
        payload: {
          parentId: loadedPhrase.parentId,
          id: loadedPhrase.id,
          name: loadedPhrase.phrasename,
          username: loadedPhrase.username,
          dateCreated: loadedPhrase.dateCreated,
          dateModified: loadedPhrase.dateModified,
          state: loadedPhrase.state,
        }
      })
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

  shouldComponentUpdate(nextProps) {
    let shouldChange = diffProps(nextProps, this.props, [
      'loading',
      'autosaving',
      'pristine',
      'phrase',
      'phraseId',
      'phraseName',
      'authorUsername',
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
      if (nextProps.phraseId)
        this.props.socket.emit(`client::joinRoom`, { phraseId: nextProps.phraseId })
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
    autosaving: state.phraseMeta.saving,
    pristine: state.phraseMeta.pristine,
    phrase: state.phrase,
    phraseId: state.phraseMeta.phraseId,
    phraseName: state.phraseMeta.phraseName,
    authorUsername: state.phraseMeta.authorUsername,
    currentUsername: state.auth.user.username,
    focusedTrack: state.pianoroll.currentTrack,
    consoleEmbedded:   state.navigation.consoleEmbedded,
    consoleSplitRatio: 0,//state.navigation.consoleSplitRatio,
    rackOpen: state.navigation.rackOpen,
    discussionOpen: state.navigation.discussionOpen,
    samples: state.samples,
    inputMethodsTour: state.navigation.inputMethodsTour,
    selectedTrack,
  }
}

export default withSocket(withRouter(connect(mapStateToProps)(Workstation)))
