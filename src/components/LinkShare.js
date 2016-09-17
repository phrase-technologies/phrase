import React, { Component } from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Clipboard from 'clipboard'
import isSafari from 'helpers/isSafari'

export default class LinkShare extends Component {

  render() {
    let CopiedTooltip = (
      <Tooltip id="tooltip-copied">
        { isSafari() ? "Press ⌘ + C to copy" : "Copied!" }
      </Tooltip>
    )

    return (
      <div className="input-group input-group-sm">
        <input
          type="text" className="form-control"
          defaultValue={location.href} readOnly
          ref={ref => this.linkControl = ref}
        />
        <div className="input-group-btn">
          <OverlayTrigger placement="top" overlay={CopiedTooltip} trigger="click" rootClose delayHide={1250}>
            <button className="btn btn-sm btn-bright" id="clipboard-link">
              <span className="fa fa-paperclip" />
              <span> Copy Link</span>
            </button>
          </OverlayTrigger>
          <button
            className="btn btn-sm btn-dark btn-narrow btn-facebook"
            onClick={this.facebookShare}
          >
            <span className="fa fa-fw fa-facebook" />
          </button>
          <a
            className="btn btn-sm btn-dark btn-narrow btn-twitter"
            href={`http://twitter.com/share?url=${location.href}&text=${"Check this out! @PhraseTech"}`}
            target="_blank"
          >
            <span className="fa fa-fw fa-twitter" />
          </a>
        </div>
      </div>
    )
  }

  componentDidMount() {
    let btn = document.getElementById('clipboard-link')
    this.clipboard = new Clipboard(btn, {
      text: () => location.href
    })
    this.clipboard.on('success', () => {
      setTimeout(() => { this.linkControl.select() })
    }).on('error', () => {
      setTimeout(() => { this.linkControl.select() })
    })
  }

  componentWillUnmount() {
    this.clipboard.destroy()
  }

  facebookShare() {
    FB.ui({
      method: 'share',
      href: location.href,
    }, (response) => {
      console.log(response)
    })
  }

}
