import React, { Component } from 'react';
import { connect } from 'react-redux';
import { transportAction,
         TRANSPORT_TEMPO
       } from '../actions/actions.js';

export default class PianoRoll extends Component {

  componentDidMount() {
    // Initialize DOM
    this.data = this.data || {};
    this.data.canvas = document.createElement('canvas');
    this.data.container = React.findDOMNode(this);
    this.data.container.appendChild(this.data.canvas);
    this.data.canvasContext = this.data.canvas.getContext("2d");
  //this.data.canvasContext.scale( this.data.pixelScale, this.data.pixelScale );

    // Set Scaling
    this.data.pixelScale    = window.devicePixelRatio || 1;
    this.data.canvas.width  = this.data.width  = this.data.container.clientWidth;
    this.data.canvas.height = this.data.height = this.data.container.clientHeight;

    // Render
    this.data.count = 0;
    this.viewRenderLoop();    
  }

  viewRenderLoop() {
    var r = (this.data.count + 0) % (this.props.tempo % 10);
    var g = (this.data.count + 4) % (this.props.tempo % 10);
    var b = (this.data.count + 8) % (this.props.tempo % 10);
    this.data.canvasContext.fillStyle   = "#" + r + g + b;
    this.data.canvasContext.fillRect( this.data.count % 500, this.data.count % 200, 100, 100 );
    this.data.count++;

    requestAnimationFrame(this.viewRenderLoop.bind(this));
  };

  componentWillUnmount() {
    this.data.canvas = null;
  }

  render() {
    var buttonClasses = this.props.color;

    return (
      <div className="piano-roll">
        <input value={this.props.tempo} type="number" min="1" max="999" step="1" onChange={this.props.setTempo} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    tempo: state.transportControls.tempo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTempo: (event) => dispatch(transportAction(TRANSPORT_TEMPO, event.target.value))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PianoRoll);
