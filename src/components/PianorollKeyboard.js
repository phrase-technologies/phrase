import React, { Component } from 'react'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import {
  pianorollResizeHeight,
  pianorollScrollY
} from '../reducers/reducePianoroll.js'

import PianorollKeys from './PianorollKeys.js'
import diffProps from 'helpers/diffProps'

export class PianorollKeyboard extends Component {

  render() {
    let keyWindow = this.props.yMax - this.props.yMin
    let keybedHeight = (this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop) / keyWindow
    let keybedOffset = (this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop) / keyWindow * this.props.yMin
        keybedOffset = Math.round(keybedOffset)
    let keybedWidth = keybedHeight / 12.5

    let isCompact = keybedWidth < 75
    let keybedClasses = "pianoroll-keybed"
        keybedClasses += isCompact ? " compact" : ''

    let style = {
      transform: 'translate3d(0,'+(-keybedOffset)+'px,0)',
      height: keybedHeight+'px',
      width: keybedWidth+'px'
    }

    return (
      <div className="pianoroll-keyboard">
        <div className={keybedClasses} style={style}>
          <PianorollKeys currentTrack={this.props.currentTrack} />
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.props.grid.didMount()
    this.props.grid.marginTop = 0
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, [
      'ENGINE',
      'currentTrack',
      'grid',
      'yMin',
      'yMax'
    ])
  }

  handleResize = () => {
    this.props.dispatch(pianorollResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop))
    this.forceUpdate()
  }
}

PianorollKeyboard.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  currentTrack: React.PropTypes.object,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired
}

export default
  provideGridSystem(
    provideGridScroll(
      PianorollKeyboard,
      {
        scrollYActionCreator: pianorollScrollY
      }
    )
  )
