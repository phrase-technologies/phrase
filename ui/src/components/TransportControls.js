import React from 'react'
import { connect } from 'react-redux'

import TransportTempo from './TransportTempo'
import TransportButton from './TransportButton'

import { isMacintosh } from 'helpers/compatibilityHelpers'

import {
  transportPlayToggle,
  transportRewindPlayhead,
  transportAdvancePlayhead,
  transportStop,
  transportRecord,
  transportCountIn,
  transportMetronome,
} from '../reducers/reduceTransport.js'

let TransportControls = (props) => {
  let { dispatch, playing, playhead, recording, countIn, metronome, existingPhrase, ownerOfPhrase } = props
  let enterLabel = isMacintosh() ? `Return` : `Enter`
  let stopType = !playhead || playing ? "stop" : "step-backward"
  let stopTooltip = !playhead || playing ? `Stop Playback (${enterLabel})` : `Return to beginning (${enterLabel})`
  let playTooltip = playing ? "Pause (Space)" : "Play (Space)"
  let editable = !existingPhrase || ownerOfPhrase

  return (
    <div className="btn-toolbar transport">
      <TransportTempo editable={editable} isAudio={props.isAudio} />
      <div className="btn-group hidden-xs">
        <TransportButton
          onButtonClick={() => dispatch(transportRewindPlayhead())}
          toggle={false} tooltip="Rewind Playhead (<)"
        >
          <i className="fa fa-fw fa-backward" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportAdvancePlayhead())}
          toggle={false} tooltip="Advance Playhead (>)"
        >
          <i className="fa fa-fw fa-forward" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportStop())}
          toggle={false} tooltip={stopTooltip}
        >
          <i className={`fa fa-fw fa-${stopType}`} />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportPlayToggle())}
          toggle={playing} color="green" tooltip={playTooltip}
        >
          <i className="fa fa-fw fa-play" />
        </TransportButton>
        <TransportButton
          onButtonClick={() => dispatch(transportRecord())}
          toggle={recording} color="red" tooltip="Record (R)"
          disabled={!editable || props.isAudio}
        >
          <i className="fa fa-fw fa-circle" />
        </TransportButton>
      </div>
      { props.isAudio ||
        <div className="btn-group hidden-xs">
          <TransportButton
            onButtonClick={() => dispatch(transportCountIn())}
            toggle={countIn} tooltip="Count In (⇧M)" narrow={true} link={true}
          >
            <span style={{ fontSize:  8 }}>1</span>
            <span style={{ fontSize: 10 }}>2</span>
            <span style={{ fontSize: 12 }}>3</span>
            <span style={{ fontSize: 14 }}>4</span>
          </TransportButton>
          <TransportButton
            onButtonClick={() => dispatch(transportMetronome())}
            toggle={metronome} tooltip='Metronome (M)' narrow={true} link={true}
          >
            <i className="phrase-icon-metronome" />
          </TransportButton>
        </div>
      }
      { mobilePlayButton(props) }
    </div>
  )
}

function mobilePlayButton({ dispatch, playing, playhead }) {
  let buttonClasses = "btn btn-primary btn-sm"
  let stopHandler = () => dispatch(transportStop())
  let playHandler = () => dispatch(transportPlayToggle())
  let stopType = !playhead || playing ? "stop" : "step-backward"

  return (
    <div className="btn-group visible-xs-block">
      <button
        type="button" className={buttonClasses}
        onClick={stopHandler}
        tabIndex="-1"
      >
        <i className={`fa fa-fw fa-${stopType}`} />
      </button>
      <button
        type="button" className={buttonClasses}
        onClick={playHandler}
        tabIndex="-1"
      >
        <i className={`fa fa-fw fa-${playing ? 'pause' : 'play'}`} />
      </button>
    </div>
  )
}

function mapStateToProps(state) {
  let selectedTrack = state.phrase.present.tracks.find(x => x.id === state.phraseMeta.trackSelectionID)

  return {
    ...state.transport,
    existingPhrase: state.phraseMeta.phraseId,
    ownerOfPhrase: state.phraseMeta.authorUsername === state.auth.user.username,
    isAudio: selectedTrack.type === "AUDIO",
  }
}

export default connect(mapStateToProps)(TransportControls)
