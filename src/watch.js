import React, {  useCallback, useRef, useState } from 'react';
import { observer } from "mobx-react"
import { svgEllipseArc } from './svg-arc';
import './watch.css';


const Watch = observer(({ knobs, buttons, player }) => {
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

  return (<svg className="watch" width="320" height="320" tabIndex="0" onWheel={onWheel} onFocus={onFocus} onBlur={onBlur}>
    <Ring activeKnob={activeKnob} rotation={rotation} />
    <svg className="bevel" x="13" y="13" width="294" height="294">
      <circle cx="147" cy="147" r="147" className="bevel-circle" />
      { buttons.map((button, i) => (<Button {...button} key={`button-${i}`} index={i} total={buttons.length} />)) }
      <svg className="display" x="27" y="27" width="240" height="240">
        <circle cx="120" cy="120" r="120" className="display-circle" />
        { knobs.map((knob, i) => (<Knob {...knob} key={`knob-${i}`} index={i} total={knobs.length} isSelected={knob === activeKnob} select={() => setActiveKnob(knobs[i])}/>)) }
        <ActiveSelection activeKnob={activeKnob}/>
        <Oscilloscope />
      </svg>
    </svg>
  </svg>);
});

function Ring({ activeKnob, rotation }) {
  const parts = [];
  //parts.push(svgEllipseArc([160, 160],[160,160], [-Math.PI/180, Math.PI/90], 0));
  for (let i=0; i<20; ++i) {
    parts.push(svgEllipseArc([160, 160],[160,160], [0, Math.PI/360], Math.PI*2 / 20 * i));
  }
  const d = parts.join(' ');
  
  return <svg className="ring" width="320" height="320">
    <circle className="ring-circle" cx="160" cy="160" r="160" />
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
    <text x="120" y="80" className="main-name-text">{activeKnob.name}</text>
    <text x="120" y="100" className="main-value-text">{activeKnob.label}</text>
    </svg>
  );
}

function Oscilloscope() {
  return <canvas />
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
