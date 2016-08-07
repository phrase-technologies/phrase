import React from 'react'

export default (props) => {
  if (!props.show)
    return null
    
  return (
    <div className="hint-ring">
      <div className="hint-ring-a" />
      <div className="hint-ring-b" />
      <div className="hint-ring-c" />
      <div className="hint-ring-d" />
    </div>
  )
}
