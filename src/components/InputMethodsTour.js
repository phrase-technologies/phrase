import React from 'react'
import { Carousel } from 'react-bootstrap'

import ExternalMidiController from 'components/ExternalMidiController'
import MusicalTyping from 'components/MusicalTyping'

export default (props) => {

  if (!props.show) {
    return null
  }

  let caretPosition = props.openInputMethod ? 82 + 32 * props.openInputMethod : 42
  let caretClasses = 'input-tour-caret' + (props.openInputMethod ? ' dark' : '')

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
      <h3 className={`input-tour-header ${props.openInputMethod ? 'collapsed' : ''}`}>
        Four ways to create your Phrase:
        <button className="close" onClick={() => props.setOpenInputMethod(null)}>
          &times;
        </button>
      </h3>
      <Carousel
        activeIndex={props.openInputMethod} onSelect={props.setOpenInputMethod}
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
                    <div className="input-tour-intro-method" onClick={() => props.setOpenInputMethod(method.key)}>
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
            <div className="mouse-tools-item">
              <span className="mouse-tools-icon">
                <span className="fa fa-fw fa-scissors fa-rotate-270" />
              </span>
              4. <strong>Slice</strong> - click any note to separate it into two
            </div>
            <div className="mouse-tools-item">
              <span className="mouse-tools-icon">
                <span style={{ padding: "0 5px 0 4px" }}>V</span>
              </span>
              5. <strong>Velocity</strong> - click and drag any note to adjust its velocity
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <h4 className="text-center">4. Microphone / Line-in</h4>
          <p className="text-center" style={{ paddingTop: 30 }}>
            <strong>
              Coming Soon
            </strong>
            <span> - we'll let you know when we launch this feature!</span>
          </p>
          <form>
            <div className="input-group" style={{ width: 300, margin: 'auto' }}>
              <input type="text" className="form-control form-control-dark" placeholder="Email" defaultValue={localStorage.email} />
              <span className="input-group-btn">
                <button className="btn btn-dark" type="button">Get Notified!</button>
              </span>
            </div>
          </form>
        </Carousel.Item>
      </Carousel>
      <div className={caretClasses} style={{ left: caretPosition }} />
    </div>
  )
}
