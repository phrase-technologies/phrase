import React, { Component } from 'react'
import { Carousel } from 'react-bootstrap'
import LaddaButton from 'react-ladda'
import { connect } from 'react-redux'

import ExternalMidiController from 'components/ExternalMidiController'
import MusicalTyping from 'components/MusicalTyping'

import { api } from 'helpers/ajaxHelpers'

export default class InputMethodsTour extends Component {
  state = {
    signupMic: { 
      success: localStorage.signupMicSuccess === `true`,
      message: `` 
    },
    signupMicCalling: false,
  }

  signupMicNotification = async (email) => {
    this.setState({ signupMicCalling: true })
    let response = await api({
      endpoint: `signup-mic-list`,
      body: { email }
    })
    let message = ``
    if (!response.success) message = `Invalid email, please try again`
    localStorage.setItem(`signupMicSuccess`, response.success)
    this.setState({
      signupMic: {
        success: response.success,
        message,
      },
      signupMicCalling: false,
    })
  }

  render() {
    if (!this.props.show) {
      return null
    }

    let caretPosition = this.props.openInputMethod ? 82 + 32 * this.props.openInputMethod : 42
    let caretClasses = 'input-tour-caret' + (this.props.openInputMethod ? ' dark' : '')

    let introArray = [
      {
        key: 1,
        iconClass: "phrase-icon-pianoroll",
        title: "External MIDI Controller",
      },
      {
        key: 2,
        iconClass: "fa fa-fw fa-keyboard-o",
        title: "Musical Typing via Computer Keyboard",
      },
      {
        key: 3,
        iconClass: "fa fa-fw fa-mouse-pointer",
        title: "Mouse Tools",
      },
      {
        key: 4,
        iconClass: "fa fa-fw fa-microphone",
        title: "Microphone / Line-in",
      },
    ]


    return (
      <div className="input-tour">
        <h3 className={`input-tour-header ${this.props.openInputMethod ? 'collapsed' : ''}`}>
          Four ways to create with Phrase:
          <button className="close" onClick={() => this.props.setOpenInputMethod(null)}>
            &times;
          </button>
        </h3>
        <Carousel
          activeIndex={this.props.openInputMethod} onSelect={this.props.setOpenInputMethod}
          indicators={false} interval={null} wrap={false}
          prevIcon={<span className="fa fa-chevron-left" />}
          nextIcon={<span className="fa fa-chevron-right" />}
        >
          <Carousel.Item>
            <div className="input-tour-intro">
              <div className="row">
                {
                  introArray.map((method) => (
                    <div className="col-xs-3" key={method.key}>
                      <div className="input-tour-intro-method" onClick={() => this.props.setOpenInputMethod(method.key)}>
                        <div className="input-tour-intro-method-icon">
                          <span className={method.iconClass} />
                        </div>
                        <h4 className="input-tour-intro-method-title">
                          { method.key + '. ' + method.title }
                        </h4>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <h4 className="text-center">1. External MIDI Controller</h4>
            <ExternalMidiController />
          </Carousel.Item>
          <Carousel.Item>
            <h4 className="text-center">2. Musical Typing via Computer Keyboard</h4>
            <MusicalTyping />
          </Carousel.Item>
          <Carousel.Item>
            <h4 className="text-center">3. Mouse Tools</h4>
            <div className="mouse-tools">
              <img
                src={require('../img/pianoroll-drag-and-drop.png')}
                width={150} className="mouse-tools-graphic"
              />
              <p>
                Select from the various mouse tools in the top right hand corner.
              </p>
              <div className="mouse-tools-item">
                <span className="mouse-tools-icon">
                  <span className="fa fa-fw fa-mouse-pointer" />
                </span>
                1. <strong>Selection</strong> - drag and drop to select and adjust notes
              </div>
              <div className="mouse-tools-item">
                <span className="mouse-tools-icon">
                  <span className="fa fa-fw fa-pencil" />
                </span>
                2. <strong>Pencil</strong> - click anywhere to create new notes
              </div>
              <div className="mouse-tools-item">
                <span className="mouse-tools-icon">
                  <span className="fa fa-fw fa-eraser" />
                </span>
                3. <strong>Eraser</strong> - click any note to delete it
              </div>
              {/* // TEMPORARILY DISABLE UNTIL WE FIX SLICE (TODO)
              <div className="mouse-tools-item">
                <span className="mouse-tools-icon">
                  <span className="fa fa-fw fa-scissors fa-rotate-270" />
                </span>
                4. <strong>Slice</strong> - click any note to separate it into two
              </div>
              */}
              <div className="mouse-tools-item">
                <span className="mouse-tools-icon">
                  <span style={{ padding: "0 5px 0 4px" }}>V</span>
                </span>
                4. <strong>Velocity</strong> - click and drag any note to adjust its velocity
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <h4 className="text-center">4. Microphone / Line-in</h4>
            <p className="text-center" style={{ paddingTop: 30 }}>
              <strong>
                Coming Soon
              </strong>
              <span> - we'll email you when we launch this feature!</span>
            </p>
            {!this.state.signupMic.success &&
              <form>
                <div className="input-group" style={{ width: 300, margin: 'auto' }}>
                  {(!this.props.loggedIn) &&
                    <input type="text" className="form-control form-control-dark"
                    placeholder="Email" ref={ ref => this.email = ref }
                    defaultValue={localStorage.email} />
                  }
                  <span className="input-group-btn" style={{ textAlign: 'center' }}>
                    <LaddaButton
                      className="btn btn-dark" type="button"
                      onClick={() => {
                        let email = this.props.loggedIn ? this.props.user.email : this.email
                        this.signupMicNotification(email)
                      }}
                      loading={this.state.signupMicCalling}>
                      Get Notified!
                    </LaddaButton>
                  </span>
                </div>
                <p style={{ marginTop: 10 }} className="text-danger text-center">
                  <strong>{!this.state.signupMic.success && this.state.signupMic.message}</strong>
                </p>
              </form>
            }
            {this.state.signupMic.success &&
              <p className="text-center"><strong>Thank you for signing up!</strong></p>
            }
          </Carousel.Item>
        </Carousel>
        <div className={caretClasses} style={{ left: caretPosition }} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(InputMethodsTour)
