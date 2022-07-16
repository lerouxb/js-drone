import React, {  useCallback, useRef, useEffect, useState } from 'react';
import { observer } from "mobx-react"
import { svgEllipseArc } from './svg-arc';
import './watch.css';

const NUM_SPOKES = 16;

const Watch = observer(({ knobs, buttons, player, nodes }) => {
  const [activeKnob, setActiveKnob] = useState(knobs[0]);

  /*
  37.5mm diameter == 240 pixels
  46mm = 294=ish pixels
  */

  const [rotation, setRotation] = useState(0);

  const onWheel = useCallback((e) => {
    const increment = e.deltaY / 12000;
    activeKnob.increment(increment);

    const newRotation = rotation + increment;
    setRotation(newRotation);
  }, [activeKnob, rotation]);

  const onFocus = useCallback(() => {
    player.start();
  }, [player]);

  const onBlur = useCallback(() => {
    player.stop();
  }, [player]);


  return (<svg className="watch" width="322" height="322" tabIndex="0" onWheel={onWheel} onFocus={onFocus} onBlur={onBlur}>
    <Ring activeKnob={activeKnob} rotation={rotation} />
    <svg className="bevel" x="14" y="14" width="292" height="292">
      <circle cx="147" cy="147" r="144" className="bevel-circle" />
      { buttons.map((button, i) => (<Button {...button} key={`button-${i}`} index={i} total={buttons.length} />)) }
      <svg className="display" x="27" y="27" width="240" height="240">
        <circle cx="120" cy="120" r="120" className="display-circle" />
        { knobs.map((knob, i) => (<Knob {...knob} key={`knob-${i}`} index={i} total={knobs.length} isSelected={knob === activeKnob} select={() => setActiveKnob(knobs[i])}/>)) }
        <ActiveSelection activeKnob={activeKnob}/>
        <Oscilloscope width="150" height="50" analyser={nodes.analyser}/>
      </svg>
    </svg>
  </svg>);
});

function Ring({ activeKnob, rotation }) {
  const parts = [];
  //parts.push(svgEllipseArc([160, 160],[160,160], [-Math.PI/180, Math.PI/90], 0));
  for (let i=0; i<NUM_SPOKES; ++i) {
    parts.push(svgEllipseArc([161, 161],[150,150], [0, Math.PI/360], Math.PI*2 / NUM_SPOKES * i));
  }
  const d = parts.join(' ');
  
  return <svg className="ring" width="322" height="322">
    <circle className="ring-circle" cx="161" cy="161" r="160" />
    <path className="grip" d={d} style={{transform: `rotate(${rotation*360}deg)`}}/>
  </svg>;
}

function Button({ index, total }) {
  //const leftSide = index < total/2;
  // TODO
  return <rect />
}

function Knob({ value, index, total, isSelected, select }) {
  const knobAngle = 2 * Math.PI / total * index - Math.PI/2;
  const bx = 120 + Math.cos(knobAngle) * 90;
  const by = 120 + Math.sin(knobAngle) * 90;

  const knobSize = 20; // enough space for whatever hangs out of the main circle base
  const knobRadius = 14;
  const indicatorRadius = 3;
  const indicatorOffset = 13;

  const ratio = value || 0;

  const indicatorAngle = ratio * Math.PI * 1.5 - Math.PI/2*2.5;

  const ix = knobSize + Math.cos(indicatorAngle) * indicatorOffset;
  const iy = knobSize + Math.sin(indicatorAngle) * indicatorOffset;

  const indicatorEl = useRef(null);

  const classes = ['knob'];
  if (isSelected) {
    classes.push('selected');
  }

  return <svg className={classes.join(' ')} x={bx - knobSize} y={by - knobSize} width={knobSize * 2} height={knobSize * 2} onClick={() => select()}>
    <circle className="base" cx={knobSize} cy={knobSize} r={knobRadius} />
    <circle className="indicator" cx={ix} cy={iy} r={indicatorRadius} ref={indicatorEl}/>
  </svg>;
}

function ActiveSelection({ activeKnob }) {
  return (
    <svg>
    <text x="120" y="61" className="main-name-text">{activeKnob.name}</text>
    <text x="120" y="85" className="main-value-text">{activeKnob.label}</text>
    </svg>
  );
}

const Oscilloscope = ({ analyser, ...props }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {

    if (!analyser) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    let frameCount = 0;
    let animationFrameId;

    //Our draw came here
    const render = () => {
      frameCount++;

      animationFrameId = window.requestAnimationFrame(render);

      analyser.getByteTimeDomainData(dataArray);

      context.fillStyle = '#f2f2f2';
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.lineWidth = 2;
      context.strokeStyle = 'rgb(0, 0, 0)';

      context.beginPath();

      const sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT/2;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }

        x += sliceWidth;
      }

      context.lineTo(canvas.width, canvas.height/2);
      context.stroke();
    }

    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [analyser]);
  
  return <foreignObject x="50" y="95" width="140" height="50">
    <canvas ref={canvasRef} {...props} xmlns="http://www.w3.org/1999/xhtml"/>
  </foreignObject>;
}

/*
    if (!state.started) {
      state.started = true;
      initNodes();
      const currentTime = audioCtx.currentTime;
      for (const oscillator of Object.values(nodes.oscillators)) {
        oscillator.start(currentTime + 0.1);
      }
      nodes.lfos.chorus.start(currentTime + 0.1);
    }
    nodes.gains.output.gain.value = state.volume;
*/

export default Watch;
