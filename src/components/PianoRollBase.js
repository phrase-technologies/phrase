import React from 'react';
import CanvasComponent from './CanvasComponent';

export default class PianoRollBase extends CanvasComponent {
  constructor(){
    super();
    this.data = this.data || {};
    this.data.marginTop = 40;
    this.data.marginBottom = 30;
  }

  // Grid Calculations
  getBarRange(){ return this.props.barMax - this.props.barMin; };
  getKeyRange(){ return this.props.keyMax - this.props.keyMin; };
  keyToYCoord(key){ return ( ( key / this.props.keyCount ) - this.props.keyMin ) / this.getKeyRange() * (this.data.height - this.data.pixelScale*(this.data.marginTop + this.data.marginBottom)) + this.data.pixelScale*this.data.marginTop; };
  barToXCoord(bar){ return ( ( bar / this.props.barCount ) - this.props.barMin ) / this.getBarRange() * (this.data.width  - this.data.pixelScale*20)                                             + this.data.pixelScale*10; };
  percentToKey(percent){ return Math.ceil( percent * this.props.keyCount ); }; // Where percent is between 0.000 and 1.000
  percentToBar(percent){ return Math.ceil( percent * this.props.barCount ); }; // Where percent is between 0.000 and 1.000
}
