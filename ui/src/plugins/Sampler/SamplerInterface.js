import React from 'react'

let style = {
  container: {
    height: `150px`,
    padding: `10px`,
    backgroundColor: `rgb(150, 34, 69)`,
  },
  title: {
    fontSize: `3rem`,
    fontWeight: 100,
  }
}

let SamplerInterface = ({ track, update }) => {
  return (
    <div id="Plugin__Sampler" style={style.container}>
      <div style={style.title}>SAMPLER</div>
    </div>
  )
}

export default SamplerInterface
