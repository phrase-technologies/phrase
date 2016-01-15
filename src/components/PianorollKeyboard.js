import React, { Component } from 'react';
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import { pianorollHeight,
         pianorollScrollY } from '../actions/actions.js';

export class PianorollKeyboard extends Component {

  render() {
    var keyWindow = this.props.yMax - this.props.yMin;
    var keybedHeight = ( this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop ) / keyWindow;
    var keybedOffset = ( this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop ) / keyWindow * this.props.yMin;
    var keybedWidth = keybedHeight / 12.5;

    var isCompact = keybedWidth < 100;

    var style = {
      transform: 'translate3d(0,'+(-keybedOffset)+'px,0)',
      height: keybedHeight+'px',
      width: keybedWidth+'px'
    };

    return (
      <div className="pianoroll-keyboard">
        <div className="pianoroll-keybed" style={style}>
          { this.renderKeys(isCompact) }
        </div>
      </div>
    );
  }

  renderKeys(isCompact) {
    var octave = 8;
    var octaves = [];
    var keys = [];
    for( var key = 88; key > 0; key-- )
    {
      // Fill the row for the black keys
      let keyClass = "pianoroll-key";
          keyClass += ( key % 12 in {2:true, 0:true, 10: true, 7: true, 5: true} ) ? ' black' : ' white';
          keyClass += ( key % 12 in {2:true,  7:true} ) ? ' higher' : '';
          keyClass += ( key % 12 in {10:true, 5:true} ) ? ' lower' : '';
          keyClass += ( key % 12 in {6:true} ) ? ' thinner' : '';
          keyClass += isCompact ? ' compact' : '';
      let keyLabel =  {1:'A', 11:'G', 9:'F', 8:'E', 6:'D', 4:'C', 3:'B'}[ key%12 ];
          keyLabel = keyLabel ? (keyLabel + octave) : null;

      keys.push(<div key={key} className={keyClass}><div className="pianoroll-key-label">{keyLabel}</div></div>);

      // Next keys into octave Group
      if( key % 12 === 4 || key == 1 )
      {
        // Add Octave Label for full octaves
        let label = isCompact ? 'C' + octave : '';
        keys.unshift(<div className="pianoroll-octave-label" key={label}><div>{label}</div></div>);
        octaves.push(<div className="pianoroll-octave" key={octave}>{keys}</div>);
        keys = [];
        octave--;
      }
    }
    return octaves;
  }

  constructor() {
    super(...arguments)

    this.handleResize = this.handleResize.bind(this)
  }

  componentDidMount() {
    this.props.grid.didMount()
    this.props.grid.marginTop = 30;
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize() {
    this.props.dispatch(pianorollHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop));
    this.forceUpdate();
  }
}

PianorollKeyboard.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  yMin:       React.PropTypes.number.isRequired,
  yMax:       React.PropTypes.number.isRequired
};

export default provideGridSystem(
  provideGridScroll(
    PianorollKeyboard,
    {
      scrollYActionCreator: pianorollScrollY
    }
  )
)
