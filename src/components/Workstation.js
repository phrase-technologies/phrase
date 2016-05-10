import React, { Component } from 'react'
import { connect } from 'react-redux'

import { layoutConsoleSplit } from 'actions/actionsLayout'

import WorkstationHeader from './WorkstationHeader'
import WorkstationSplit from './WorkstationSplit'
import Mixer from './Mixer'
import Pianoroll from './Pianoroll'

export class Workstation extends Component {

  render() {
    let workstationClasses = "workstation disable-select"
        workstationClasses += this.props.maximized ? ' workstation-maximized' : ''
    let minimizeMixer = this.props.consoleSplitRatio < 0.2 && this.props.focusedTrack !== null
    let minimizeClipEditor = this.props.consoleSplitRatio > 0.8 || this.props.focusedTrack === null

    return (
      <div className={workstationClasses}>
        <WorkstationHeader maximize={this.maximize} maximized={this.props.maximized} />
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

  maximize = () => {
    // Do nothing if already maximized
    if (this.props.maximized)
      return

    let phraseURL = localStorage.getItem('lastOpenPhrase') || '/phrase/new'
    this.context.router.push(phraseURL)
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
      'focusedTrack',
      'consoleEmbedded',
      'consoleSplitRatio',
      'maximized'
    ]
    return propsToCheck.some(prop => nextProps[prop] !== this.props[prop])
  }
}

Workstation.contextTypes = {
  router: React.PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    focusedTrack: state.pianoroll.currentTrack,
    consoleEmbedded:   state.navigation.consoleEmbedded,
    consoleSplitRatio: state.navigation.consoleSplitRatio
  }
}

export default connect(mapStateToProps)(Workstation)
