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

let provideGridSystem = (ChildComponent) => {

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
      this.grid.calculateZoomThreshold = this.calculateZoomThreshold
      this.grid.getBarRange = this.getBarRange
      this.grid.getKeyRange = this.getKeyRange
      this.grid.getActiveHeight = this.getActiveHeight
      this.grid.getActiveWidth = this.getActiveWidth
      this.grid.keyToYCoord = this.keyToYCoord
      this.grid.barToXCoord = this.barToXCoord
      this.grid.percentToKey = this.percentToKey
      this.grid.percentToBar = this.percentToBar
      this.grid.getMouseYPercent = this.getMouseYPercent
      this.grid.getMouseXPercent = this.getMouseXPercent

      // This callback
      this.grid.didMount = () => {
        if (!this.grid.init) {
          this.grid.init = true
          this.grid.container = this.grid.container || ReactDOM.findDOMNode(this)
          this.handleResize()
        }
      }
    }

    componentDidMount() {
      this.grid.didMount()
      window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize)
    }

    handleResize = () => {
      this.grid.pixelScale = window.devicePixelRatio || 1
      this.grid.width  = this.grid.container.clientWidth  * this.grid.pixelScale
      this.grid.height = this.grid.container.clientHeight * this.grid.pixelScale
    }

    // Grid Calculations
    getBarRange = () => { return this.props.xMax - this.props.xMin }
    getKeyRange = () => { return this.props.yMax - this.props.yMin }
    getActiveHeight = () => { return this.grid.height - this.grid.pixelScale*(this.grid.marginTop  + this.grid.marginBottom) }
    getActiveWidth = () => { return this.grid.width  - this.grid.pixelScale*(this.grid.marginLeft + this.grid.marginRight)  }
    keyToYCoord = (key) => { return (((key + 8) / this.props.keyCount) - this.props.yMin) / this.grid.getKeyRange() * this.grid.getActiveHeight() + this.grid.pixelScale*this.grid.marginTop  } // Offset key by 8 due to 1st key = MIDI #9
    barToXCoord = (bar) => { return (((bar)     / this.props.barCount) - this.props.xMin) / this.grid.getBarRange() * this.grid.getActiveWidth()  + this.grid.pixelScale*this.grid.marginLeft }
    percentToKey = (percent) => { return Math.ceil(percent * this.props.keyCount) } // Where percent is between 0.000 and 1.000
    percentToBar = (percent) => { return Math.ceil(percent * this.props.barCount) } // Where percent is between 0.000 and 1.000
    getMouseYPercent = (e) => { return this.grid.pixelScale * (e.clientY - this.grid.container.getBoundingClientRect().top  - this.grid.marginTop)  / this.grid.getActiveHeight() }
    getMouseXPercent = (e) => { return this.grid.pixelScale * (e.clientX - this.grid.container.getBoundingClientRect().left - this.grid.marginLeft) / this.grid.getActiveWidth()  }

    // Calculate thresholds at which to draw barline thicknesses
    calculateZoomThreshold = () => {
      if (this.props.xMin || this.props.xMax) {
        let pixelsPerBar = this.grid.getActiveWidth() / (this.props.barCount*this.grid.getBarRange()) / this.grid.pixelScale

        let thresholdsWithKeys = [
          { threshold:   10.0, majorLine: 16.000, middleLine: 4.0000, minorLine: null      },
          { threshold:   20.0, majorLine:  4.000, middleLine: 4.0000, minorLine: 2.0000    },
          { threshold:   40.0, majorLine:  4.000, middleLine: 1.0000, minorLine: null      },
          { threshold:   80.0, majorLine:  1.000, middleLine: 0.5000, minorLine: null      },
          { threshold:  160.0, majorLine:  1.000, middleLine: 0.5000, minorLine: 0.2500    },
          { threshold:  320.0, majorLine:  1.000, middleLine: 0.2500, minorLine: 0.1250    },
          { threshold:  640.0, majorLine:  0.250, middleLine: 0.1250, minorLine: null      },
          { threshold: 1280.0, majorLine:  0.250, middleLine: 0.0625, minorLine: 0.03125   }
        ]

        let thresholdsNoKeys = [
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
        this.grid.lineThresholdsWithKeys = thresholdsWithKeys.find((x) => {
          return x.threshold > pixelsPerBar || x.threshold >= 1280 // Always use last one (800) if we get there
        })
        this.grid.lineThresholdsNoKeys = thresholdsNoKeys.find((x) => {
          return x.threshold > pixelsPerBar || x.threshold >= 1280 // Always use last one (800) if we get there
        })
      }
    }

  }

}

export default provideGridSystem
