import React from 'react'
import './loader.css'

const Loader = ({scale=1}) => {
  const sfn = i => i*scale  // Scale value
  return (
    <div className="indicator" style={{zIndex: 999}}>
      <svg width={sfn(16)+"px"} height={sfn(12)+"px"}>
        <polyline id="back" points={[sfn(1),sfn(6),sfn(4),sfn(6),sfn(6),sfn(11),sfn(10),sfn(1),sfn(12),sfn(6),sfn(15),sfn(6)].join(' ')}></polyline>
        <polyline id="front" style={{strokeDasharray: sfn(12)+", "+sfn(36), strokeDashoffset: sfn(48)}}
        points={[sfn(1),sfn(6),sfn(4),sfn(6),sfn(6),sfn(11),sfn(10),sfn(1),sfn(12),sfn(6),sfn(15),sfn(6)].join(' ')}></polyline>
      </svg>
    </div>
  )
}

export default Loader
