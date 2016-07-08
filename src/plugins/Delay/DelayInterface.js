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

let options = [
  { display: `1/16`, value: 0.0625, },
  { display: `1/8`, value: 0.125, },
  { display: `1/4`, value: 0.25, },
  { display: `1/2`, value: 0.5, },
  { display: `1/1`, value: 1, },
]

let DelayInterface = ({ config, update }) => {
  return (
    <div id="Plugin__Delay" style={style.container}>
      <div style={style.title}>DELAY</div>
      <div style={{ display: `flex`, marginLeft: `auto` }}>
        { options.map(option =>
          <button
            key={option.value}
            className={config.time === option.value ? `active` : ``}
            style={style.button}
            onClick={() => update({ ...config, time: option.value })}
          >
            {option.display}
          </button>
        )}
      </div>
    </div>
  )
}

export default DelayInterface
