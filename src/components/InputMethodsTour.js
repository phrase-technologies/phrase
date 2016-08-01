import React from 'react'
import { Carousel } from 'react-bootstrap'

export default (props) => {

  if (!props.show) {
    return null
  }

  return (
    <div className="workstation-footer-input-tour">
      <Carousel
        activeIndex={props.openInputMethod} onSelect={props.setOpenInputMethod}
        indicators={false} interval={null} wrap={false}
        prevIcon={<span className="fa fa-chevron-left" />}
        nextIcon={<span className="fa fa-chevron-right" />}
      >
        <Carousel.Item>
          <h4>
            <span className="phrase-icon-pianoroll" />
            <span> External MIDI Controller</span>
          </h4>
          <div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <h4>
            <span className="fa fa-keyboard-o" />
            <span> Musical Typing via Computer Keyboard</span>
          </h4>
        </Carousel.Item>
        <Carousel.Item>
          <h4>
            <span className="fa fa-mouse-pointer" />
            <span> Mouse Tools</span>
          </h4>
        </Carousel.Item>
        <Carousel.Item>
          <h4>
            <span className="fa fa-microphone" />
            <span> Microphone / Line-in</span>
          </h4>
        </Carousel.Item>
      </Carousel>
      <button className="close" onClick={() => props.setOpenInputMethod(null)}>&times;</button>
      <div className="workstation-footer-input-tour-caret" style={{ left: 110 + 30*props.openInputMethod }} />
    </div>
  )
}
