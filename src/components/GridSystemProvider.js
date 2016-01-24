// ============================================================================
// GridSystem Provider Component
// ============================================================================
// This is a Higher-Order-Component (HOC) which provides a grid object
// and associated helper methods which are useful in rendering and manipulating
// musical grids. For example, the Pianoroll will use this grid system extensively
// to display the grid of notes and bars.
//
// USAGE:
//   Wrap a component at export: `export default provideGridSystem(SomeComponent)`
//   In the child component, the grid object will be available at `this.props.grid`
//   Call `this.grid.didMount()` in the child component's `componentDidMount()`
//   method to initialize it without having to wait for the React reconciliation
//   to recurse back to the parent.
//
// See also: GridScrollProvider.js

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

var provideGridSystem = (ChildComponent) => {

  return class extends Component {

    render() {
      return (
        <ChildComponent {...this.props} grid={this.grid} />
      )
    }

    constructor(){
      super(...arguments)

      // Prepare the grid system to pass to the child
      this.grid = this.grid || {}
      this.grid.marginTop    = 0
      this.grid.marginBottom = 0
      this.grid.marginLeft   = 0
      this.grid.marginRight  = 0
      this.grid.calculateZoomThreshold = this.calculateZoomThreshold.bind(this)
      this.grid.getBarRange = this.getBarRange.bind(this)
      this.grid.getKeyRange = this.getKeyRange.bind(this)
      this.grid.getActiveHeight = this.getActiveHeight.bind(this)
      this.grid.getActiveWidth = this.getActiveWidth.bind(this)
      this.grid.keyToYCoord = this.keyToYCoord.bind(this)
      this.grid.barToXCoord = this.barToXCoord.bind(this)
      this.grid.percentToKey = this.percentToKey.bind(this)
      this.grid.percentToBar = this.percentToBar.bind(this)
      this.grid.getMouseYPercent = this.getMouseYPercent.bind(this)
      this.grid.getMouseXPercent = this.getMouseXPercent.bind(this)

      // This callback 
      this.grid.didMount = () => {
        if (!this.grid.init) {
          this.grid.init = true
          this.grid.container = this.grid.container || ReactDOM.findDOMNode(this)
          this.handleResize()
        }
      }

      this.handleResize = this.handleResize.bind(this)
    }

    componentDidMount() {
      this.grid.didMount()
      window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize)
    }

    handleResize() {
      this.grid.pixelScale = window.devicePixelRatio || 1
      this.grid.width  = this.grid.container.clientWidth  * this.grid.pixelScale
      this.grid.height = this.grid.container.clientHeight * this.grid.pixelScale
    }

    // Grid Calculations
    getBarRange(){ return this.props.xMax - this.props.xMin }
    getKeyRange(){ return this.props.yMax - this.props.yMin }
    getActiveHeight(){ return this.grid.height - this.grid.pixelScale*(this.grid.marginTop  + this.grid.marginBottom) }
    getActiveWidth (){ return this.grid.width  - this.grid.pixelScale*(this.grid.marginLeft + this.grid.marginRight ) }
    keyToYCoord(key){ return ( ( key / this.props.keyCount ) - this.props.yMin ) / this.grid.getKeyRange() * this.grid.getActiveHeight() + this.grid.pixelScale*this.grid.marginTop  }
    barToXCoord(bar){ return ( ( bar / this.props.barCount ) - this.props.xMin ) / this.grid.getBarRange() * this.grid.getActiveWidth()  + this.grid.pixelScale*this.grid.marginLeft }
    percentToKey(percent){ return Math.ceil( percent * this.props.keyCount ) } // Where percent is between 0.000 and 1.000
    percentToBar(percent){ return Math.ceil( percent * this.props.barCount ) } // Where percent is between 0.000 and 1.000
    getMouseYPercent(e){ return this.grid.pixelScale * (e.clientY - this.grid.container.getBoundingClientRect().top  - this.grid.marginTop)  / this.grid.getActiveHeight() }
    getMouseXPercent(e){ return this.grid.pixelScale * (e.clientX - this.grid.container.getBoundingClientRect().left - this.grid.marginLeft) / this.grid.getActiveWidth()  }

    // Calculate thresholds at which to draw barline thicknesses
    calculateZoomThreshold() {
      if( this.props.xMin || this.props.xMax )
      {
        var pixelsPerBar = this.grid.getActiveWidth() / (this.props.barCount*this.grid.getBarRange()) / this.grid.pixelScale

        var thresholdsWithKeys = [
          { threshold:   10.0, majorLine: 16.000, middleLine: 4.0000, minorLine: null      },
          { threshold:   20.0, majorLine:  4.000, middleLine: 4.0000, minorLine: 2.0000    },
          { threshold:   40.0, majorLine:  4.000, middleLine: 1.0000, minorLine: null      },
          { threshold:   80.0, majorLine:  1.000, middleLine: 0.5000, minorLine: null      },
          { threshold:  160.0, majorLine:  1.000, middleLine: 0.5000, minorLine: 0.2500    },
          { threshold:  320.0, majorLine:  1.000, middleLine: 0.2500, minorLine: 0.1250    },
          { threshold:  640.0, majorLine:  0.250, middleLine: 0.1250, minorLine: null      },
          { threshold: 1280.0, majorLine:  0.250, middleLine: 0.0625, minorLine: 0.03125   }
        ]

        var thresholdsNoKeys = [
          { threshold:   10.0, majorLine: 16.000, middleLine: 4.0000, minorLine: 1.0000    },
          { threshold:   20.0, majorLine:  4.000, middleLine: 4.0000, minorLine: 1.0000    },
          { threshold:   40.0, majorLine:  4.000, middleLine: 1.0000, minorLine: 0.5000    },
          { threshold:   80.0, majorLine:  1.000, middleLine: 0.5000, minorLine: 0.2500    },
          { threshold:  160.0, majorLine:  1.000, middleLine: 0.2500, minorLine: null      },
          { threshold:  320.0, majorLine:  1.000, middleLine: 0.2500, minorLine: 0.0625    },
          { threshold:  640.0, majorLine:  0.250, middleLine: 0.0625, minorLine: null      },
          { threshold: 1280.0, majorLine:  0.250, middleLine: 0.0625, minorLine: 0.015625  }
        ]

        // Find the first threshold that fits
        this.grid.lineThresholdsWithKeys = thresholdsWithKeys.find(function(x){
          return x.threshold > pixelsPerBar || x.threshold >= 1280 // Always use last one (800) if we get there
        })
        this.grid.lineThresholdsNoKeys = thresholdsNoKeys.find(function(x){
          return x.threshold > pixelsPerBar || x.threshold >= 1280 // Always use last one (800) if we get there
        })
      }
    }

  }

}

export default provideGridSystem
