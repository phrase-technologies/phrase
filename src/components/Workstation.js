import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { phraseLoadFromDb, phraseNewPhrase } from 'reducers/reducePhrase'
import { layoutConsoleSplit } from 'actions/actionsLayout'

import WorkstationHeader from './WorkstationHeader'
import WorkstationSplit from './WorkstationSplit'
import Mixer from './Mixer'
import Pianoroll from './Pianoroll'

export class Workstation extends Component {

  componentDidMount() {
    let { dispatch, params } = this.props

    // Load existing phrase from URL param
    if (params.phraseId)
      dispatch(phraseLoadFromDb(params.phraseId))

    // Load brand new phrase
    else
      this.props.dispatch(phraseNewPhrase())

    // Set Leave Hook ("You have unsaved changes!")
    this.props.router.setRouteLeaveHook(this.props.route, this.leaveHook)
  }

  render() {
    if (this.props.loading) {
      return (
        <div className="workstation workstation-maximized disable-select text-center">
          <div className="workstation-loading text-center">
            <span className="fa fa-music fa-2x" />
            <p style={{ marginTop: 15 }}>
              Loading Phrase...
            </p>
          </div>
        </div>
      )
    }

    let minimizeMixer = this.props.consoleSplitRatio < 0.2 && this.props.focusedTrack !== null
    let minimizeClipEditor = this.props.consoleSplitRatio > 0.8 || this.props.focusedTrack === null

    return (
      <div className="workstation workstation-maximized disable-select">
        <WorkstationHeader />
        <div className="workstation-body">
          <div className="workstation-main" style={this.getMainSplit()}>
            <div className="workstation-mixer" style={this.getMixerSplit()}>
              <Mixer minimized={minimizeMixer} maximize={() => this.setConsoleSplit(0.5)} />
            </div>
            <WorkstationSplit splitRatio={this.props.consoleSplitRatio} setRatio={this.setConsoleSplit} />
            <div className="workstation-clip" style={this.getClipSplit()}>
              <Pianoroll minimized={minimizeClipEditor} maximize={() => this.setConsoleSplit(0.5)} />
            </div>
          </div>
          <div className="workstation-effects-chain" style={this.getSidebarSplit()}>
            <h2 className="workstation-heading">
              <span className="workstation-heading-vertical">
                <span>Effects Chain </span>
                <span className="fa fa-plus-square" />
              </span>
            </h2>
          </div>
        </div>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    // Phrase ID Changed!
    if (nextProps.params.phraseId !== this.props.params.phraseId) {

      // Phrase changed because of autosaving new phrase - do not interrupt!
      // let pristine = this.props.phrase.past.length + this.props.phrase.future.length === 0
      if (nextProps.params.phraseId && !this.props.params.phraseId && nextProps.autosaving === "DO_NOT_RELOAD")
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
    let pristine = this.props.phrase.past.length + this.props.phrase.future.length === 0
    let newPhrasePage = !this.props.params.phraseId

    return newPhrasePage && !pristine && this.props.autosaving !== "DO_NOT_RELOAD"
      ? `Your Phrase is not saved and changes will be lost. ${this.props.route.path}`
      : null
  }

  componentDidUpdate() {
    this.props.router.setRouteLeaveHook(this.props.route, this.leaveHook)
  }

  setConsoleSplit = (ratio) => {
    this.props.dispatch(layoutConsoleSplit(ratio))
    window.dispatchEvent(new Event('resize'))
  }

  getMixerSplit() {
    if (this.props.focusedTrack === null) return { bottom: 0 }
    else if (this.props.consoleSplitRatio < 0.2) return { height: 45 }
    else if (this.props.consoleSplitRatio > 0.8) return { bottom: 45 }
    return { bottom: ((1 - this.props.consoleSplitRatio) * 100) + '%' }
  }

  getClipSplit() {
    if (this.props.focusedTrack === null) return { display: 'none' }
    else if (this.props.consoleSplitRatio < 0.2) return { top:    45 }
    else if (this.props.consoleSplitRatio > 0.8) return { height: 45 }
    return { top: (this.props.consoleSplitRatio  * 100) + '%' }
  }

  getMainSplit() {
    return this.props.sidebar ? { right: 300 } : { right: 45 }
  }

  getSidebarSplit() {
    return this.props.sidebar ? { width: 300 } : { width: 45 }
  }

  shouldComponentUpdate(nextProps) {
    // Ensure all canvases are re-rendered upon clip editor being shown
    if (this.props.focusedTrack === null && nextProps.focusedTrack !== null) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0) // Some lifecycle methods are missed on the first event propogation due to race conditions
    }

    let propsToCheck = [
      'loading',
      'phrase',
      'phraseId',
      'phraseName',
      'authorUsername',
      'focusedTrack',
      'consoleEmbedded',
      'consoleSplitRatio',
    ]
    return propsToCheck.some(prop => nextProps[prop] !== this.props[prop])
  }
}

function mapStateToProps(state) {
  return {
    loading: state.phraseMeta.loading,
    autosaving: state.phraseMeta.saving,
    phrase: state.phrase,
    phraseId: state.phraseMeta.phraseId,
    phraseName: state.phraseMeta.phraseName,
    authorUsername: state.phraseMeta.authorUsername,
    focusedTrack: state.pianoroll.currentTrack,
    consoleEmbedded:   state.navigation.consoleEmbedded,
    consoleSplitRatio: state.navigation.consoleSplitRatio
  }
}

export default withRouter(connect(mapStateToProps)(Workstation))
