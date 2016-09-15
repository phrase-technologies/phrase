import React, { Component } from 'react'
import { Tooltip, Popover, OverlayTrigger } from 'react-bootstrap'
import Clipboard from 'clipboard'
import isSafari from 'helpers/isSafari'

export default class LinkShare extends Component {

  constructor() {
    super()
    this.state = {
      clipboard: false,
    }
  }

  render() {
    let ClipboardTooltip = (
      <Tooltip
        id="tooltip-clipboard"
        style={{ visibility: this.state.clipboard ? 'hidden' : 'visible' }}
      >
        Copy shareable link
      </Tooltip>
    )
    let CopiedTooltip = (
      <Tooltip
        id="tooltip-copied"
        style={{ visibility: this.state.clipboard ? 'visible' : 'hidden' }}
      >
        Copied!
      </Tooltip>
    )

    // Safari doesn't support clipboard api - show a popoover instead
    let safariClick = {}
    if (isSafari()) {
      CopiedTooltip = (
        <Tooltip
          id="tooltip-clipboard"
          style={{ visibility: this.state.clipboard ? 'visible' : 'hidden' }}
        >
          Press ⌘ + C to copy
        </Tooltip>
      )
      safariClick.trigger = "click"
      safariClick.rootClose = true
    }

    return (
      <div className="input-group input-group-sm">
        <input
          type="text" className="form-control"
          defaultValue={location.href} readOnly
          ref={ref => this.linkControl = ref}
        />
        <div className="input-group-btn">
          <OverlayTrigger placement="top" overlay={CopiedTooltip} delayHide={1250} {...safariClick} onExit={this.copyFinish}>
            <OverlayTrigger placement="top" overlay={ClipboardTooltip} delayShow={250}>
              <button
                className="btn btn-sm btn-bright clipboard-link"
                data-clipboard-text={location.href}
                onClick={() => this.linkControl.select()}
              >
                <span className="fa fa-paperclip" />
                <span> Link</span>
              </button>
            </OverlayTrigger>
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
    this.clipboard = new Clipboard('.clipboard-link')
    this.clipboard.on('success', () => {
      this.setState({ clipboard: 'copied' })
    }).on('error', () => {
      this.setState({ clipboard: 'safari' })
      setTimeout(() => {
        this.safariSelection.select()
      })
    })
  }

  componentWillUnmount() {
    this.clipboard.destroy()
  }

  copyFinish = () => {
    this.setState({ clipboard: false })
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
