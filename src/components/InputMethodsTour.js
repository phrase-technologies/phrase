import React from 'react'
import { Carousel } from 'react-bootstrap'

export default (props) => {

  if (!props.show) {
    return null
  }

  let caretPosition = props.openInputMethod ? 75 + 25 * props.openInputMethod : 40
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
      title: <span>Microphone <br/> / Line-in</span>,
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
                        { method.title }
                      </h4>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <h4 className="text-center">
            <span>1. </span>
            <span className="phrase-icon-pianoroll" />
            <span> External MIDI Controller</span>
          </h4>
          <div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <h4 className="text-center">
            <span>2. </span>
            <span className="fa fa-keyboard-o" />
            <span> Musical Typing via Computer Keyboard</span>
          </h4>
        </Carousel.Item>
        <Carousel.Item>
          <h4 className="text-center">
            <span>3. </span>
            <span className="fa fa-mouse-pointer" />
            <span> Mouse Tools</span>
          </h4>
        </Carousel.Item>
        <Carousel.Item>
          <h4 className="text-center">
            <span>4. </span>
            <span className="fa fa-microphone" />
            <span> Microphone / Line-in</span>
          </h4>
          <p className="text-center" style={{ paddingTop: 40 }}>
            Coming Soon!
          </p>
          <form>
            <div className="input-group" style={{ width: 300, margin: 'auto' }}>
              <input type="text" className="form-control" placeholder="Email" />
              <span className="input-group-btn">
                <button className="btn btn-default" type="button">Get Notified!</button>
              </span>
            </div>
          </form>
        </Carousel.Item>
      </Carousel>
      <div className={caretClasses} style={{ left: caretPosition }} />
    </div>
  )
}
