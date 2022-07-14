import { makeObservable, observable, action, computed, override } from "mobx"
import notes from './notes';

const RESONANCE_SCALE = 30;
const CHORUS_SCALE = 100;
const VOLUME_SCALE = 1/2;

class Knob {
  constructor(name, value = 0) {
    this.name = name;
    this.value = value;

    makeObservable(this, {
      name: observable,
      value: observable,
      increment: action,
      label: computed,
      param: computed
    });
  }

  increment(delta) {
    this.value = Math.max(Math.min(this.value + delta, 1), 0);
  }

  get label() {
    return this.value.toFixed(2);
  }

  get param() {
    return this.value;
  }
}

class PitchKnob extends Knob {
  constructor(value) {
    super('Pitch', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get noteNumber() {
    return Math.floor(this.value * (notes.length - 1));
  }

  get frequency() {
    return 26.5 + Math.pow(2, this.value * 8.691743519171276);
  }

  get label() {
    //const freq = notes[this.noteNumber][2];
    //return `${freq.toFixed(2)}Hz`;
    //const noteName = notes[this.noteNumber][1];
    //return noteName.split('/')[0];
    return `${this.frequency.toFixed(2)}Hz`;
  }

  get param() {
    //const freq = notes[this.noteNumber][2];
    //return freq;
    return this.frequency;
  }
}

class HarmonicsKnob extends Knob {
  constructor(value) {
    super('Harmonics', value);
    makeObservable(this, {
      label: override
    });
  }

  get label() {
    return Math.min(1 + this.value * 4, 5).toFixed(2);
  }
}

class CutoffKnob extends Knob {
  constructor(value) {
    super('Cutoff', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get frequency() {
    return Math.pow(2, 5 + this.value * 9);
  }

  get label() {
    return `${this.frequency.toFixed(0)}Hz`;
  }

  get param() {
    return this.frequency;
  }
}

class ResonanceKnob extends Knob {
  constructor(value) {
    super('Resonance', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get label() {
    return (this.value * RESONANCE_SCALE).toFixed(2);
  }

  get param() {
    return this.value * RESONANCE_SCALE;
  }
}

class AnimateKnob extends Knob {
  constructor(value) {
    super('Animate', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get label() {
    return `${this.value.toFixed(2)}Hz`;
  }

  get param() {
    return this.value;
  }
}

class ChorusKnob extends Knob {
  constructor(value) {
    super('Chorus', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get label() {
    return `${(this.value * CHORUS_SCALE).toFixed(2)}ms`;
  }

  get param() {
    return this.value * CHORUS_SCALE / 1000; // CHORUS_SCALE gets you to ms, but the audio param is in seconds
  }
}

class GainKnob extends Knob {
  constructor(value) {
    super('Gain', value);
    makeObservable(this, {
      label: override
    });
  }

  get label() {
    return this.value.toFixed(2);
  }
}

class VolumeKnob extends Knob {
  constructor(value) {
    super('Volume', value);
    makeObservable(this, {
      label: override,
      param: override
    });
  }

  get label() {
    return this.value.toFixed(2);
  }

  get param() {
    return this.value / 5 * VOLUME_SCALE; // because 5 oscillators and VOLUME_SCALE to further scale it
  }
}

export const knobs = [
  new PitchKnob(0.57),
  new HarmonicsKnob(1),
  new CutoffKnob(1),
  new ResonanceKnob(0),
  new AnimateKnob(0),
  new ChorusKnob(30/CHORUS_SCALE),
  new GainKnob(0.2),
  new VolumeKnob(0.2/VOLUME_SCALE),
];
