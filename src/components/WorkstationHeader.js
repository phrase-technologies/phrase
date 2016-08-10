import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tooltip, OverlayTrigger, MenuItem } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/lib/Dropdown'

import WorkstationHeaderTitle from './WorkstationHeaderTitle'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor'
import WorkstationHeaderStorage from './WorkstationHeaderStorage'
import WorkstationHeaderShare from './WorkstationHeaderShare'
import TransportControls from './TransportControls'

import {
  phraseLoginReminder,
  phraseRephraseReminder,
  phraseRephrase,
  phraseQuantizeSelection,
} from 'reducers/reducePhrase'
import {
  changeQuantizeDivision,
  quantizerDivisions } from 'reducers/reduceQuantizer'
import { arrangeToolSelect } from 'reducers/reduceArrangeTool'
import { exportToMidi } from 'actions/actionsMidi'
import isSafari from 'helpers/isSafari'
import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export class WorkstationHeader extends Component {
  constructor() {
    super()
    this.state = {
      quantizeDropdownIsOpen: false,
    }
  }

  render() {
    let containerClasses = "container container-maximize"
        containerClasses += isSafari() ? ' container-safari-fix' : ''

    return (
      <div className="workstation-header" style={{ zIndex: 500 }}>
        <div className={containerClasses} style={{ position: 'relative' }}>
          <div className="btn-toolbar" style={{ position: 'absolute', top: 3, left: 0 }}>
            <div className="btn-group">
              { this.renderRephraseButton() }
            </div>
            <div className="btn-group">
              { this.renderRephraseReminder() }
            </div>
          </div>
          <div className="text-center">
            { this.renderLoginReminder() }
            <div className="btn-group">
              <WorkstationHeaderTitle />
              <WorkstationHeaderAuthor />
            </div>
          </div>
          <div className="btn-toolbar" style={{ position: 'absolute', top: 3, right: 0 }}>
            <div className="btn-group">
              <span className="workstation-header-share">
                Share:
              </span>
            </div>
            <WorkstationHeaderShare />
            <div className="btn-group">
              { this.renderMIDIExportButton() }
            </div>
          </div>
        </div>
        <div className="workstation-divider" />
        <WorkstationHeaderStorage {...this.props} style={{ position: 'absolute', top: 65, left: 15 }} />
        <div className="text-center">
          <TransportControls style={{ display: 'inline-block' }} />
        </div>
        <div className="btn-toolbar" style={{ position: 'absolute', top: 65, right: 15 }}>
          { this.renderQuantizeTool() }
          { this.renderEditTool() }
        </div>
      </div>
    )
  }

  renderLoginReminder() {
    return this.props.loginReminder ? (
      <div
        className="popover bottom" onClick={this.dismissLoginReminder}
        style={{ display: 'block', left: 'auto', right: 0, top: -13, color: '#333' }}
      >
        <div className="arrow" style={{ right: 25, left: 'auto' }} />
        <div className="popover-content" style={{ padding: '5px 10px' }}>
          To <strong>save</strong> and <strong>share</strong> your phrase,
          login!
        </div>
      </div>
    ) : null
  }

  renderMIDIExportButton() {
    let disabled = !this.props.existingPhrase && this.props.pristine
    let MIDIExportTooltip = <Tooltip id="tooltip-midi-export">Export to MIDI file (.mid)</Tooltip>

    return (
      <OverlayTrigger placement="top" overlay={MIDIExportTooltip} delayShow={250}>
        <button
          className="btn btn-sm btn-dark"
          disabled={disabled} {...makeButtonUnfocusable}
          onClick={ () => this.props.dispatch(exportToMidi()) }
         >
          <span className="fa fa-download" />
          <span> MIDI</span>
        </button>
      </OverlayTrigger>
    )
  }

  renderRephraseButton() {
    let RephraseTooltip = <Tooltip id="tooltip-rephrase">Make a copy of this Phrase</Tooltip>

    return this.props.existingPhrase ? (
      <OverlayTrigger placement="top" overlay={RephraseTooltip} delayShow={250}>
        <button
          className="btn btn-sm btn-bright"
          onClick={this.rephrase} {...makeButtonUnfocusable}
        >
          <span className="fa fa-pencil-square-o" />
          <span> Rephrase</span>
        </button>
      </OverlayTrigger>
    ) : null
  }

  renderRephraseReminder() {
    return this.props.rephraseReminder ? (
      <div
        className="popover right"  onClick={this.dismissRephraseReminder}
        style={{ display: 'block', color: '#333', width: 210 }}
      >
        <div className="arrow" style={{ top: 16 }} />
        <div className="popover-content" style={{ padding: '5px 10px' }}>
          To save your changes to this phrase, <strong>rephrase</strong> it!
          <a className="btn btn-link btn-xs" href="/TODO" target="_blank" style={{ float: 'none', color: '#555' }}>
            <span className="fa fa-question-circle"/> Help
          </a>
        </div>
      </div>
    ) : null
  }

  renderQuantizeTool() {
    let { dispatch } = this.props
    let QuantizeDivision = <Tooltip id="tooltip-quantize-division">Quantize Division</Tooltip>
    let QuantizeTooltip = <Tooltip id="tooltip-quantize-tool">Quantize Tool (Q)</Tooltip>
    let QuantizeDivisionDropdownActive = this.state.quantizeDropdownIsOpen ? `active` : ``

    return (
      <div className="btn-group" style={{ right: 10 }}>
        <OverlayTrigger placement="top" overlay={QuantizeTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow` }
            onClick={() => dispatch(phraseQuantizeSelection())} {...makeButtonUnfocusable}>
            <span>Q</span>
          </button>
        </OverlayTrigger>
        <div className={ `btn btn-dark btn-narrow` } style={{ pointerEvents: `none` }}>
          <span>{quantizerDivisions.find((item) => item.val === this.props.quantizeDivision).label}</span>
        </div>
        <Dropdown
          id="workstation-quantize-division" className="dropdown-dark" pullRight
          onToggle={isOpen => this.setState({ quantizeDropdownIsOpen: isOpen })}
          onSelect={this.selectQuantizeDivision}>
          <button
            className={ `dropdown-toggle btn btn-dark btn-narrow ${QuantizeDivisionDropdownActive}` }
            bsRole="toggle" {...makeButtonUnfocusable}>
            <OverlayTrigger placement="top" overlay={QuantizeDivision} delayShow={250}>
              <span className="fa">&#9660;</span>
            </OverlayTrigger>
          </button>
          <Dropdown.Menu>
            {
              quantizerDivisions.map((item, i) => {
                if (item.val)
                  return <MenuItem eventKey={item.val} key={i}>{item.label}</MenuItem>
                return <MenuItem divider key={i}/>
              })
            }
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  selectQuantizeDivision = (e, division) => {
    let self = document.getElementById('workstation-quantize-division')
    self.focus()
    self.blur() // Fix issue where quantize arrow stays focused when it shouldn't be
    this.props.dispatch(changeQuantizeDivision(division))
  }

  renderEditTool() {
    let { arrangeTool, dispatch } = this.props
    let DefaultTooltip = <Tooltip id="tooltip-default-tool">Selection Tool (1)</Tooltip>
    let PencilTooltip = <Tooltip id="tooltip-pencil-tool">Pencil Tool (2)</Tooltip>
    let EraserTooltip = <Tooltip id="tooltip-eraser-tool">Eraser Tool (3)</Tooltip>
    let SliceTooltip = <Tooltip id="tooltip-slice-tool">Slice Tool (4)</Tooltip>
    let VelocityTooltip = <Tooltip id="tooltip-velocity-tool">Velocity Tool (5)</Tooltip>

    return (
      <div className="btn-group">
        <OverlayTrigger placement="top" overlay={DefaultTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `pointer` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`pointer`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-mouse-pointer" />
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={PencilTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `pencil` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`pencil`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-pencil" />
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={EraserTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `eraser` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`eraser`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-eraser" />
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={SliceTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `scissors` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`scissors`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-scissors fa-rotate-90" />
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={VelocityTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `velocity` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`velocity`))}
          >
            <span style={{ padding: `0 0.45rem` }}>V</span>
          </button>
        </OverlayTrigger>
      </div>
    )
  }

  rephrase = () => {
    this.props.dispatch(phraseRephrase())
  }

  dismissRephraseReminder = () => {
    this.props.dispatch(phraseRephraseReminder({ show: false }))
  }

  dismissLoginReminder = () => {
    this.props.dispatch(phraseLoginReminder({ show: false }))
  }

}

function mapStateToProps(state) {
  return {
    undoable: state.phrase.past.length,
    redoable: state.phrase.future.length,
    existingPhrase: state.phraseMeta.phraseId,
    saving: state.phraseMeta.saving,
    pristine: state.phraseMeta.pristine,
    lastSavedTimestamp: state.phraseMeta.dateModified,
    loginReminder: state.phraseMeta.loginReminder,
    rephraseReminder: state.phraseMeta.rephraseReminder,
    arrangeTool: state.arrangeTool,
    quantizeDivision: state.quantizer.division,
  }
}

export default connect(mapStateToProps)(WorkstationHeader)
