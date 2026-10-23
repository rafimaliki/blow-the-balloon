// Synthesised sound: a breathy hiss while blowing and a sharp pop. No audio files to load.
// The AudioContext starts on the first press, since browsers block sound before a gesture.

export function createSfx() {
  let ctx = null;
  let noise = null;
  let breath = null;

  function ensure() {
    if (ctx) return ctx.state === 'suspended' ? ctx.resume() : undefined;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();

    // Two seconds of white noise, reused by every sound.
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 900;
    band.Q.value = 0.6;
    breath = ctx.createGain();
    breath.gain.value = 0;
    src.connect(band).connect(breath).connect(ctx.destination);
    src.start();
  }

  return {
    unlock: ensure,

    // level 0..1; follows the puffs of the breath.
    breathe(level) {
      if (!breath) return;
      breath.gain.setTargetAtTime(level * 0.16, ctx.currentTime, 0.05);
    },

    pop() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.setValueAtTime(6000, t);
      low.frequency.exponentialRampToValueAtTime(300, t + 0.25);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      src.connect(low).connect(gain).connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.35);
    },
  };
}
