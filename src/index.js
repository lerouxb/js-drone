import React from 'react';
import ReactDOM from 'react-dom/client';
import { makeObservable, observable, action } from "mobx"
import './index.css';
import Watch from './watch';
import { knobs } from './knobs';
import { initNodes, nodes } from './nodes';
import reportWebVitals from './reportWebVitals';

let started = false;
let audioCtx;

function getKnob(name) {
  return knobs.find((knob) => knob.name === name);
}

class Player {
  paused = true;

  constructor() {
    makeObservable(this, {
      paused: observable,
      start: action,
      stop: action
    })
  }

  start() {
    console.log('start');
    if (!started) {
      started = true;
      audioCtx = initNodes(this, knobs);
      const currentTime = audioCtx.currentTime;
      for (const oscillator of Object.values(nodes.oscillators)) {
        oscillator.start(currentTime + 0.1);
      }
      nodes.lfos.chorus.start(currentTime + 0.1);
    }
    this.paused = false;
    nodes.gains.input.gain.value = getKnob('Volume').param;
  }

  stop() {
    console.log('stop');
    this.paused = true;
    nodes.gains.input.gain.value = 0;
  }
}

const buttons = [
  {},
  {},
  {},
  {},
  {},
  {}
];

const player = new Player();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Watch buttons={buttons} knobs={knobs} player={player} />
    <p>Prototype. Mouse-only for now. Click on the "watch" to focus it and start
    the audio, click outside to blur and stop. Click a "knob" to select it, use
    the mousewheel to change that value.</p>
    <p>The animate knob still does nothing, chorus needs lots of work and
    resonance is very unstable - don't change it too fast.</p>
    <p>Inspired by <a href="https://youtu.be/G46L06M6R0I" target="_blank" rel="noreferrer">The Runner</a>
    and <a href="https://joshuageisler.medium.com/modeling-an-analog-delay-in-the-web-audio-api-4ac1024e925" target="_blank" rel="noreferrer">Joshua Geisler</a>.</p>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
