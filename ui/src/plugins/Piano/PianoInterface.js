import React from 'react'

let style = {
  container: {
    padding: `10px`,
    backgroundColor: `rgb(34, 101, 150)`,
    display: `flex`
  },
  title: {
    fontSize: `3rem`,
    fontWeight: 100,
    color: `WHITE`
  },
  button: {
    color: `rgb(34, 101, 150)`,
    border: `1px solid #ccc`,
    borderRadius: `20px`,
    margin: `5px`,
    padding: `4px 8px`,
    fontWeight: 300,
    fontSize: `14px`,
    cursor: `pointer`,
  }
}

let PianoInterface = ({ track, update }) => {
  return (
    <div id="Plugin__Piano" style={style.container}>
      <div style={style.title}>PIANO</div>
    </div>
  )
}

export default PianoInterface
