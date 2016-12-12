// ============================================================================
// Tween Provider Component
// ============================================================================
// This is a Higher-Order-Component (HOC) which debounces and tweens specified
// props before passing them to children. Basically, this is used to animate
// a numeric prop. The original case is for adding inertia scroll to the
// Pianoroll/Clip-editor's horizontantal scrolling when a different clip is
// selected, so that the user gets a smooth transition from one context to 
// the next, rather than a jarring one.
//
// USAGE:
//   Wrap a component at export:
//   `export default provideTween(["propToTween1", "propToTween2", ...], SomeComponent)`
//
// propToTween1 and propToTween2 will be passed to SomeComponent unchanged unless
// the change in value exceeds a threshold. The logic is that normal scrolling
// happens in small increments, whereas when a different clip is selected it is
// generally a fairly big jump.

import React, { Component } from 'react'

var provideTween = (propsToTween, ChildComponent) => {

  return class extends Component {

    render() {
      return (
        <ChildComponent {...this.props} {...this.tweenedProps} />
      )
    }

    shouldComponentUpdate(nextProps) {
      var tweenRequired = propsToTween.some(propName => {
        return Math.abs(this.props[propName] - nextProps[propName]) > 0.01
      })

      // Small adjustment, no tweening required - pass values down as is
      if (!tweenRequired) {
        this.tweenedProps = null
        return true

      // Large adjustment - Tween it!
      } else {
        // Initialize Tweening
        this.tweenStartTime = Date.now()
        this.tweenStartValues = {}
        this.tweenedProps = {}
        this.tweenTargetValues = {}
        propsToTween.forEach(propName => {
          this.tweenStartValues[propName]  = this.props[propName]
          this.tweenedProps[propName]      = this.props[propName]
          this.tweenTargetValues[propName] = nextProps[propName]
        })

        this.animationInterval = setInterval(() => {
          // Exited in previous iteration
          if (!this.tweenedProps)
            return

          // Calculate the next tween
          var t = Date.now() - this.tweenStartTime
          propsToTween.forEach(propName => {
            this.tweenedProps[propName] = this.tweenStartValues[propName] + (this.tweenTargetValues[propName] - this.tweenStartValues[propName]) * 0.5 * (1 - Math.cos(t/250*Math.PI))
          })

          // Can we end the tweening after this frame?
          if (t > 250) {
            this.tweenedProps = null
            clearInterval(this.animationInterval)
          }

          // console.log( "Tweening: ", this.tweenedProps)
          this.forceUpdate()
        }, 15)

        return false
      }
    }
  }

}

export default provideTween
