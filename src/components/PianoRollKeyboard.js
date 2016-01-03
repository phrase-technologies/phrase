import React from 'react';
import TimelineBase from './TimelineBase';
import { connect } from 'react-redux';

import { pianoRollHeight } from '../actions/actions.js';

export default class PianoRollKeyboard extends TimelineBase {

  constructor() {
    super();
    this.data.marginTop = 30;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if( nextProps.keyMin == this.props.keyMin
     && nextProps.keyMax == this.props.keyMax
     && nextProps.keyCount == this.props.keyCount )
      return false;
    else
      return true;
  }
  
  renderKeys(isCompact) {
    var octave = 8;
    var octaves = [];
    var keys = [];
    for( var key = 88; key > 0; key-- )
    {
      // Fill the row for the black keys
      let keyClass = "piano-roll-key";
          keyClass += ( key % 12 in {2:true, 0:true, 10: true, 7: true, 5: true} ) ? ' black' : ' white';
          keyClass += ( key % 12 in {2:true,  7:true} ) ? ' higher' : '';
          keyClass += ( key % 12 in {10:true, 5:true} ) ? ' lower' : '';
          keyClass += ( key % 12 in {6:true} ) ? ' thinner' : '';
          keyClass += isCompact ? ' compact' : '';
      let keyLabel =  {1:'A', 11:'G', 9:'F', 8:'E', 6:'D', 4:'C', 3:'B'}[ key%12 ];
          keyLabel = keyLabel ? (keyLabel + octave) : null;

      keys.push(<div key={key} className={keyClass}><div className="piano-roll-key-label">{keyLabel}</div></div>);

      // Next keys into octave Group
      if( key % 12 === 4 || key == 1 )
      {
        // Add Octave Label for full octaves
        let label = isCompact ? 'C' + octave : '';
        keys.unshift(<div className="piano-roll-octave-label" key={label}><div>{label}</div></div>);
        octaves.push(<div className="piano-roll-octave" key={octave}>{keys}</div>);
        keys = [];
        octave--;
      }
    }
    return octaves;
  }

  render() {
    var keyWindow = this.props.keyMax - this.props.keyMin;
    var keybedHeight = ( this.data.height / this.data.pixelScale - this.data.marginTop ) / keyWindow;
    var keybedOffset = ( this.data.height / this.data.pixelScale - this.data.marginTop ) / keyWindow * this.props.keyMin - 0.5; // 0.5 to fix alignment with grid (possibly due to closestHalfPixel)
    var keybedWidth = keybedHeight / 12.5;

    var isCompact = keybedWidth < 100;

    var style = {
      top: -keybedOffset+'px',
      height: keybedHeight+'px',
      width: keybedWidth+'px'
    };

    return (
      <div className="piano-roll-keyboard">
        <div className="piano-roll-keybed" style={style}>
          { this.renderKeys(isCompact) }
        </div>
      </div>
    );
  }

  handleResize() {
    super.handleResize();
    this.props.dispatch(pianoRollHeight(this.data.height / this.data.pixelScale - this.data.marginTop));
    this.forceUpdate();
  }
}

PianoRollKeyboard.propTypes = {
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired
};

export default connect()(PianoRollKeyboard);
