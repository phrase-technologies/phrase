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

let DelayInterface = ({ config, update }) => {
  return (
    <div id="Plugin__Delay" style={style.container}>
      <div style={style.title}>DELAY</div>
    </div>
  )
}

export default DelayInterface
