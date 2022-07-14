import { autorun } from "mobx";

export const nodes = {};

// see https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
function makeDistortionCurve(amount=20) {
  let n_samples = 256, curve = new Float32Array(n_samples);
  for (let i = 0 ; i < n_samples; ++i ) {
      let x = i * 2 / n_samples - 1;
      curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function initNodes(player, knobs) {
  function getKnob(name) {
    return knobs.find((knob) => knob.name === name);
  }
  
  // create web audio api context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // create Oscillator nodes
  const root = audioCtx.createOscillator();
  const min1 = audioCtx.createOscillator();
  const fifth = audioCtx.createOscillator();
  const plus1 = audioCtx.createOscillator();
  const plus2 = audioCtx.createOscillator();
  
  const oscillators = [root, min1, fifth, plus1, plus2];
  const oscillatorGains = [];
  
  nodes.oscillators = {
    root,
    min1,
    fifth,
    plus1,
    plus2
  };
  
  const input = audioCtx.createGain();
  const feedback = audioCtx.createGain();
  const output = audioCtx.createGain();

  const distortion = audioCtx.createWaveShaper();
  distortion.oversample = '4x';
  distortion.curve = makeDistortionCurve(400);
  
  const lowpass = audioCtx.createBiquadFilter(); 
  lowpass.type = 'lowpass';
  
  nodes.filters = {
    lowpass
  };
  
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.0375;
  
  feedback.gain.value = 0.3;
  
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.0005; // TODO: should this come from a setting somehow?
  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);
  
  nodes.delays = {
    chorus: delay
  };
  
  nodes.lfos = {
    chorus: lfo
  }

  for (const [i, oscillator] of oscillators.entries()) {
    oscillator.type = 'square';
    const oscillatorGain = audioCtx.createGain();
    oscillatorGain.gain.value = 1;
    oscillatorGains.push(oscillatorGain);
    oscillator.connect(oscillatorGain).connect(input);
  }

  const analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  nodes.analyser = analyser;

  input.connect(distortion);
  distortion.connect(lowpass);
  lowpass.connect(output);
  delay.connect(output);
  lowpass.connect(delay).connect(feedback).connect(lowpass);
  output.connect(analyser).connect(audioCtx.destination);

  nodes.gains = {
    ...oscillatorGains,
    input,
    feedback,
    output
  };
  
  // TODO: cross-fade the harmonics
  // TODO: should the oscillators go a bit out of sync?
  // TODO: "gain" type distortion
  // TODO: LFO for controlling everything
  // TODO: oscilloscope
  // TODO: noise + sample/hold might be better for modulating delay time


  autorun(() => {
    /*
    console.log('Volume', getKnob('Volume').param);
    console.log('Pitch', getKnob('Pitch').param);
    console.log('Cutoff', getKnob('Cutoff').param);
    console.log('Resonance', getKnob('Resonance').param);
    console.log('Chorus', getKnob('Chorus').param);
    */

    // TODO: for all these things set the value at some time

    if (!player.paused) {
      // only change the volume is we're playing otherwise we'll start playing even though the player is paused
      nodes.gains.input.gain.value = getKnob('Volume').param;
    }

    const pitch = getKnob('Pitch').param;

    root.frequency.value = pitch;
    min1.frequency.value = pitch / 2;
    fifth.frequency.value = pitch * 3 / 2;
    plus1.frequency.value = pitch * 2;
    plus2.frequency.value = pitch * 2 * 2;

    const harmonics = getKnob('Harmonics').value;
    // the first one (the root pitch) is always volume 100%
    for (let i = 1; i < 5; i++) {
      oscillatorGains[i].gain.value = Math.min(Math.max(harmonics - ((i-1) * 0.25), 0) * 4, 1);
      //console.log(i, oscillatorGains[i].gain.value);
    }

    lowpass.frequency.value = getKnob('Cutoff').param;
    //lowpass.Q.value = getKnob('Resonance').param;
    lowpass.Q.value = getKnob('Resonance').param;
    
    // TODO: should the knob control the LFO frequency, LFO gain, delay time or feedback gain?
    nodes.delays.chorus.delayTime.value = getKnob('Chorus').param;
    nodes.lfos.chorus.frequency.value = 0.1;

    distortion.curve = makeDistortionCurve(getKnob('Gain').value * 100);
  });

  return audioCtx;
}
