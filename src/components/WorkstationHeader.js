import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tooltip, OverlayTrigger, MenuItem } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/lib/Dropdown'

import WorkstationHeaderTitle from './WorkstationHeaderTitle'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor'
import WorkstationHeaderStorage from './WorkstationHeaderStorage'
import TransportControls from './TransportControls'
import HintRing from 'components/HintRing'

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
  state = {
    quantizeDropdownIsOpen: false,
  }

  render() {
    let editable = !this.props.existingPhrase || this.props.ownerOfPhrase

    let containerClasses = "container container-maximize"
        containerClasses += isSafari() ? ' container-safari-fix' : ''

    return (
      <div className="workstation-header">
        <div className={containerClasses} style={{ position: 'relative' }}>
          <div className="btn-toolbar workstation-header-rephrase">
            { !editable &&
              <Dropdown id="workstation-permissions" className="dropdown-dark">
                <button
                  className="dropdown-toggle btn btn-sm btn-primary"
                  bsRole="toggle" {...makeButtonUnfocusable}
                >
                  <span className="fa fa-eye" />
                  <span> View Only </span>
                  <span className="caret" />
                </button>
                <Dropdown.Menu>
                  <MenuItem header>
                    <small>
                      You do not have access to edit this Phrase,<br/>
                      and any changes you make will not be saved.<br/>
                      Click the "REPHRASE" button above to get<br/>
                      your own editable copy.
                    </small>
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            }
            { this.renderRephraseButton() }
            { this.renderRephraseReminder() }
          </div>
          <div className="text-center">
            { this.renderLoginReminder() }
            <div className="btn-group">
              <WorkstationHeaderTitle />
              <WorkstationHeaderAuthor />
            </div>
          </div>
          <div className="btn-toolbar workstation-header-social">
            <div className="btn-group">
              { this.renderMIDIExportButton() }
            </div>
          </div>
        </div>
        <div className="workstation-divider" />
        <WorkstationHeaderStorage {...this.props} />
        <div className="workstation-controls">
          <TransportControls />
        </div>
        { editable &&
          <div className="btn-toolbar workstation-header-tools">
            { this.renderQuantizeTool() }
            <div className="btn-group">
              <HintRing show={this.props.inputMethodsTour === 3} />
            </div>
            { this.renderEditTool() }
          </div>
        }
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
      <div className="btn-group">
        <OverlayTrigger placement="top" overlay={RephraseTooltip} delayShow={250}>
          <button
            className="btn btn-sm btn-bright"
            onClick={this.rephrase} {...makeButtonUnfocusable}
          >
            <span className="fa fa-pencil-square-o" />
            <span> Rephrase</span>
          </button>
        </OverlayTrigger>
      </div>
    ) : null
  }

  renderRephraseReminder() {
    return this.props.rephraseReminder ? (
      <div className="btn-group">
        <div
          className="popover right"  onClick={this.dismissRephraseReminder}
          style={{ display: 'block', color: '#333', width: 210, marginTop: -5 }}
        >
          <div className="arrow" style={{ top: 16 }} />
          <div className="popover-content" style={{ padding: '5px 10px' }}>
            You do not have access to save changes to this Phrase.
            To get your own editable copy, <strong>rephrase</strong> it!
            <a className="btn btn-link btn-xs" href="mailto:hello@phrase.fm" target="_blank" style={{ float: 'none', color: '#555' }}>
              <span className="fa fa-question-circle"/> Help
            </a>
          </div>
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
            className="btn btn-dark"
            onClick={() => dispatch(phraseQuantizeSelection())} {...makeButtonUnfocusable}
          >
            <span>Q </span>
            <span>{quantizerDivisions.find((item) => item.val === this.props.quantizeDivision).label}</span>
          </button>
        </OverlayTrigger>
        <Dropdown
          id="workstation-quantize-division" className="dropdown-dark" pullRight
          onToggle={isOpen => this.setState({ quantizeDropdownIsOpen: isOpen })}
          onSelect={this.selectQuantizeDivision}>
          <button
            className={ `dropdown-toggle btn btn-dark btn-narrow ${QuantizeDivisionDropdownActive}` }
            bsRole="toggle" {...makeButtonUnfocusable}>
            <OverlayTrigger placement="top" overlay={QuantizeDivision} delayShow={250}>
              <span className="caret" />
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

  selectQuantizeDivision = (division, e) => {
    e.target.focus()
    e.target.blur()
    this.props.dispatch(changeQuantizeDivision(division))
  }

  renderEditTool() {
    let { arrangeTool, dispatch } = this.props
    let DefaultTooltip = <Tooltip id="tooltip-default-tool">Selection Tool (1)</Tooltip>
    let PencilTooltip = <Tooltip id="tooltip-pencil-tool">Pencil Tool (2)</Tooltip>
    let EraserTooltip = <Tooltip id="tooltip-eraser-tool">Eraser Tool (3)</Tooltip>
    // TEMPORARILY DISABLE UNTIL WE FIX SLICE (TODO)
    // let SliceTooltip = <Tooltip id="tooltip-slice-tool">Slice Tool (4)</Tooltip>
    let VelocityTooltip = <Tooltip id="tooltip-velocity-tool">Velocity Tool (4)</Tooltip>// TEMPORARILY CHANGE from 5 to 4 UNTIL WE FIX SLICE (TODO)
    let CommentTooltip = <Tooltip id="tooltip-comment-tool">Comment Tool (5)</Tooltip>// TEMPORARILY CHANGE from 6 to 4 UNTIL WE FIX SLICE (TODO)

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
        {/* // TEMPORARILY DISABLE UNTIL WE FIX SLICE (TODO)
        <OverlayTrigger placement="top" overlay={SliceTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `scissors` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`scissors`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-scissors fa-rotate-270" />
          </button>
        </OverlayTrigger>
        */}
        <OverlayTrigger placement="top" overlay={VelocityTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `velocity` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`velocity`))} {...makeButtonUnfocusable}
          >
            <span style={{ padding: `0 0.45rem` }}>V</span>
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={CommentTooltip} delayShow={250}>
          <button
            className={ `btn btn-dark btn-narrow ${arrangeTool === `comment` ? `active` : ``}` }
            onClick={() => dispatch(arrangeToolSelect(`comment`))} {...makeButtonUnfocusable}
          >
            <span className="fa fa-fw fa-comments" />
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
    inputMethodsTour: state.navigation.inputMethodsTour,
    ownerOfPhrase: state.phraseMeta.authorUsername === state.auth.user.username,
  }
}

export default connect(mapStateToProps)(WorkstationHeader)
