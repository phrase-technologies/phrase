import React from 'react';
import CanvasComponent from './CanvasComponent';

export default class PianoRollBase extends CanvasComponent {
  // Grid Calculations
  getBarRange(){ return this.props.barMax - this.props.barMin; };
  getKeyRange(){ return this.props.keyMax - this.props.keyMin; };
  keyToYCoord(key){ return ( ( key / this.props.keyCount ) - this.props.keyMin ) / this.getKeyRange() * (this.data.height - 50*this.data.pixelScale) +  0*this.data.pixelScale; };
  barToXCoord(bar){ return ( ( bar / this.props.barCount ) - this.props.barMin ) / this.getBarRange() * (this.data.width  - 20*this.data.pixelScale) + 10*this.data.pixelScale; };
  percentToKey(percent){ return Math.ceil( percent * this.props.keyCount ); }; // Where percent is between 0.000 and 1.000
  percentToBar(percent){ return Math.ceil( percent * this.props.barCount ); }; // Where percent is between 0.000 and 1.000
}
