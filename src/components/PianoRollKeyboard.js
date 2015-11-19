import React, { Component } from 'react';

export default class PianoRollKeyboard extends Component {

  constructor() {
    super();
    this.data = {};
  }

  componentDidMount() {
    // Initialize the DOM
    this.data.container = React.findDOMNode(this);

    // Set Scaling
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
  }

  componentWillUnmount() {
    this.data.container = null;
    this.data = null;
    window.removeEventListener('resize', this.handleResize);
  }  

  shouldComponentUpdate(nextProps, nextState) {
    if( nextProps.keyMin == this.props.keyMin
     && nextProps.keyMax == this.props.keyMax
     && nextProps.keyCount == this.props.keyCount )
      return false;
    else
      return true;
  }

  handleResize() {
    this.data.height = this.data.container.clientHeight - 30;
    this.forceUpdate();
  }

  renderKeys() {
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
      let keyLabel =  {1:'A', 11:'G', 9:'F', 8:'E', 6:'D', 4:'C', 3:'B'}[ key%12 ];
          keyLabel = keyLabel ? (keyLabel + octave) : null;

      keys.push(<div key={key} className={keyClass}><div className="piano-roll-key-label">{keyLabel}</div></div>);

      // Next keys into octave Group
      if( key % 12 === 4 || key == 1 )
      {
        // Add Octave Label for full octaves
        if( key < 83 && key > 1 )
        {
          let label = 'C' + octave;
          keys.unshift(<div className="piano-roll-octave-label"><div>{label}</div></div>);
        }
        octaves.push(<div className="piano-roll-octave">{keys}</div>);
        keys = [];
        octave--;
      }
    }
    return octaves;
  }

  render() {
    var keyWindow = this.props.keyMax - this.props.keyMin;
    var keybedHeight = this.data.height / keyWindow;
    var keybedOffset = this.data.height / keyWindow * this.props.keyMin;
    var keybedWidth = keybedHeight * 0.1;
    var style = {
      top: -keybedOffset+'px',
      height: keybedHeight+'px',
      width: keybedWidth+'px'
    };

    return (
      <div className="piano-roll-keyboard">
        <div className="piano-roll-keybed" style={style}>
          { this.renderKeys() }
        </div>
      </div>
    );
  }
}

PianoRollKeyboard.propTypes = {
  keyMin:       React.PropTypes.number.isRequired,
  keyMax:       React.PropTypes.number.isRequired
};