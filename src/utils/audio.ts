/**
 * Procedural Web Audio API sound effects generator for the 3D Veggie
 * Clean, lightweight, zero dependencies, responsive.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  // Background Garden Music (BGM)
  private isBgmActive: boolean = false;
  private bgmIntervalId: ReturnType<typeof setInterval> | null = null;
  private bgmMasterGain: GainNode | null = null;
  private bgmStep: number = 0;

  // Active disco audio nodes for clean cancellation
  private activeDiscoStoppers: (() => void)[] = [];
  // Active beatbox audio nodes for clean cancellation
  private activeBeatboxStoppers: (() => void)[] = [];

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopDiscoBeat();
      this.stopBeatbox();
      if (this.bgmMasterGain && this.ctx) {
        this.bgmMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.bgmMasterGain && this.ctx && this.isBgmActive) {
        this.bgmMasterGain.gain.setValueAtTime(this.volume * 0.28, this.ctx.currentTime);
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmMasterGain && this.ctx && !this.isMuted && this.isBgmActive) {
      this.bgmMasterGain.gain.setValueAtTime(this.volume * 0.28, this.ctx.currentTime);
    }
  }

  /**
   * Cute rubbery squeak when grabbed / poked
   */
  public playSqueak(pitchModifier = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      const baseFreq = 420 * pitchModifier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.14);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Spring / Boing sound when released from drag or jumping
   */
  public playBoing(intensity = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = 160 + intensity * 60;
      osc.frequency.setValueAtTime(startFreq, now);

      // Wobble pitch like a spring
      const duration = 0.45;
      for (let i = 0; i < 6; i++) {
        const t = now + (i * duration) / 6;
        const mod = i % 2 === 0 ? 1.4 : 0.8;
        const decayedMod = 1 + (mod - 1) * Math.pow(0.5, i);
        osc.frequency.linearRampToValueAtTime(startFreq * decayedMod, t);
      }
      osc.frequency.linearRampToValueAtTime(startFreq, now + duration);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Playful giggle / tickle sound
   */
  public playGiggle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [580, 680, 820, 740, 890];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + 0.04);

        gain.gain.setValueAtTime(this.volume * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.055);
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Pop sound when switching shapes or accessories
   */
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Sneeze sound effect (windup + explosion pop)
   */
  public playSneeze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Inhale
      const oscIn = this.ctx.createOscillator();
      const gainIn = this.ctx.createGain();
      oscIn.type = 'sine';
      oscIn.frequency.setValueAtTime(220, now);
      oscIn.frequency.linearRampToValueAtTime(540, now + 0.4);
      gainIn.gain.setValueAtTime(0.01, now);
      gainIn.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.4);
      gainIn.gain.linearRampToValueAtTime(0.001, now + 0.45);
      oscIn.connect(gainIn);
      gainIn.connect(this.ctx.destination);
      oscIn.start(now);
      oscIn.stop(now + 0.45);

      // ACHOO blast
      const blastTime = now + 0.55;
      const oscBlast = this.ctx.createOscillator();
      const gainBlast = this.ctx.createGain();
      oscBlast.type = 'triangle';
      oscBlast.frequency.setValueAtTime(800, blastTime);
      oscBlast.frequency.exponentialRampToValueAtTime(160, blastTime + 0.25);
      gainBlast.gain.setValueAtTime(this.volume * 0.5, blastTime);
      gainBlast.gain.exponentialRampToValueAtTime(0.001, blastTime + 0.3);
      oscBlast.connect(gainBlast);
      gainBlast.connect(this.ctx.destination);
      oscBlast.start(blastTime);
      oscBlast.stop(blastTime + 0.3);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Cheerful chord fanfare for party mode
   */
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(this.volume * 0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Stop any active disco music notes immediately
   */
  public stopDiscoBeat() {
    this.activeDiscoStoppers.forEach((stop) => {
      try {
        stop();
      } catch {
        // ignore
      }
    });
    this.activeDiscoStoppers = [];
  }

  /**
   * High-Energy Retro Disco Groove (Full 4.2s multi-layered dance track)
   * Includes 4-on-the-floor kicks, offbeat open hi-hats, funky octave bassline,
   * vintage brass/piano stabs, and a jubilant synth lead hook!
   */
  public playDiscoBeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Clean up any previously running disco groove
    this.stopDiscoBeat();

    try {
      const now = this.ctx.currentTime;
      const bpm = 124;
      const beat = 60 / bpm; // ~0.484s
      const step16th = beat / 4; // ~0.121s
      const totalBars = 2;
      const totalSteps = totalBars * 16; // 32 steps (~3.87s + 0.4s reverb tail = ~4.2s)

      // Master disco gain
      const discoGain = this.ctx.createGain();
      discoGain.gain.setValueAtTime(this.volume * 0.85, now);
      discoGain.connect(this.ctx.destination);

      this.activeDiscoStoppers.push(() => {
        try {
          discoGain.gain.cancelScheduledValues(now);
          discoGain.gain.setValueAtTime(0, this.ctx?.currentTime || now);
        } catch {
          // ignore
        }
      });

      // 1. Kick Drum (Punchy 909-style 4-on-the-floor on every quarter beat)
      for (let b = 0; b < totalBars * 4; b++) {
        const t = now + b * beat;
        const kickOsc = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(155, t);
        kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
        kGain.gain.setValueAtTime(0.55, t);
        kGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        kickOsc.connect(kGain);
        kGain.connect(discoGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.15);

        this.activeDiscoStoppers.push(() => {
          try {
            kickOsc.stop();
          } catch {
            // ignore
          }
        });
      }

      // 2. Snappy Disco Clap / Snare on Beats 2 and 4 of each bar
      for (let bar = 0; bar < totalBars; bar++) {
        [1, 3].forEach((b) => {
          const t = now + (bar * 4 + b) * beat;
          // Dual noise-like snap
          const snareOsc = this.ctx!.createOscillator();
          const sGain = this.ctx!.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(260, t);
          snareOsc.frequency.exponentialRampToValueAtTime(90, t + 0.08);
          sGain.gain.setValueAtTime(0.35, t);
          sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
          snareOsc.connect(sGain);
          sGain.connect(discoGain);
          snareOsc.start(t);
          snareOsc.stop(t + 0.12);

          this.activeDiscoStoppers.push(() => {
            try {
              snareOsc.stop();
            } catch {
              // ignore
            }
          });
        });
      }

      // 3. Sizzling Disco Hi-Hats: Shaker 16ths + Sizzling Open Hat on every offbeat
      for (let s = 0; s < totalSteps; s++) {
        const t = now + s * step16th;
        const isOffbeat = s % 4 === 2; // the "&" of each beat
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'square';
        hatOsc.frequency.setValueAtTime(isOffbeat ? 1250 : 850, t);

        const decay = isOffbeat ? 0.09 : 0.03;
        const amp = isOffbeat ? 0.12 : 0.04;
        hatGain.gain.setValueAtTime(amp, t);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        hatOsc.connect(hatGain);
        hatGain.connect(discoGain);
        hatOsc.start(t);
        hatOsc.stop(t + decay);

        this.activeDiscoStoppers.push(() => {
          try {
            hatOsc.stop();
          } catch {
            // ignore
          }
        });
      }

      // 4. Classic Funky Walking Disco Bassline (octave jumps & syncopated groove)
      // D Minor funk progression: D2 -> D3 -> F2 -> G2 -> A2 -> C3 -> D2
      const bassNotes: { step: number; freq: number; dur: number }[] = [
        // Bar 1
        { step: 0, freq: 73.42, dur: 0.15 }, // D2
        { step: 2, freq: 146.83, dur: 0.12 }, // D3
        { step: 4, freq: 87.31, dur: 0.14 }, // F2
        { step: 6, freq: 98.0, dur: 0.12 }, // G2
        { step: 8, freq: 110.0, dur: 0.15 }, // A2
        { step: 10, freq: 73.42, dur: 0.12 }, // D2
        { step: 12, freq: 130.81, dur: 0.14 }, // C3
        { step: 14, freq: 146.83, dur: 0.12 }, // D3
        // Bar 2
        { step: 16, freq: 73.42, dur: 0.15 }, // D2
        { step: 18, freq: 146.83, dur: 0.12 }, // D3
        { step: 20, freq: 87.31, dur: 0.14 }, // F2
        { step: 22, freq: 116.54, dur: 0.14 }, // Bb2
        { step: 24, freq: 110.0, dur: 0.14 }, // A2
        { step: 26, freq: 98.0, dur: 0.12 }, // G2
        { step: 28, freq: 87.31, dur: 0.14 }, // F2
        { step: 30, freq: 146.83, dur: 0.22 }, // D3 resolve
      ];

      bassNotes.forEach(({ step, freq, dur }) => {
        const t = now + step * step16th;
        const bOsc = this.ctx!.createOscillator();
        const bFilter = this.ctx!.createBiquadFilter();
        const bGain = this.ctx!.createGain();

        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(freq, t);

        // Lowpass filter for warm punchy analog bass synth
        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(650, t);
        bFilter.frequency.exponentialRampToValueAtTime(220, t + dur);

        bGain.gain.setValueAtTime(0.32, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        bOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(discoGain);

        bOsc.start(t);
        bOsc.stop(t + dur);

        this.activeDiscoStoppers.push(() => {
          try {
            bOsc.stop();
          } catch {
            // ignore
          }
        });
      });

      // 5. Chic / Donna Summer Style Funk Chord Stabs on Offbeats
      // Chords: Dm7 (A4, C5, F5) -> G7 (G4, B4, D5) -> BbMaj7 (F4, A4, D5) -> A7 (G4, A4, C#5)
      const chordRhythm = [
        { step: 3, freqs: [440, 523.25, 698.46] }, // Dm7
        { step: 7, freqs: [392, 493.88, 587.33] }, // G
        { step: 11, freqs: [440, 523.25, 659.25] }, // Dm9
        { step: 15, freqs: [440, 554.37, 659.25] }, // A7
        { step: 19, freqs: [349.23, 440, 587.33] }, // Bb
        { step: 23, freqs: [392, 493.88, 587.33] }, // G
        { step: 27, freqs: [440, 523.25, 698.46] }, // Dm
        { step: 31, freqs: [440, 554.37, 880] }, // Big A major stab finish
      ];

      chordRhythm.forEach(({ step, freqs }) => {
        const t = now + step * step16th;
        freqs.forEach((freq) => {
          const cOsc = this.ctx!.createOscillator();
          const cGain = this.ctx!.createGain();
          cOsc.type = 'triangle';
          cOsc.frequency.setValueAtTime(freq, t);

          cGain.gain.setValueAtTime(0.12, t);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          cOsc.connect(cGain);
          cGain.connect(discoGain);
          cOsc.start(t);
          cOsc.stop(t + 0.19);

          this.activeDiscoStoppers.push(() => {
            try {
              cOsc.stop();
            } catch {
              // ignore
            }
          });
        });
      });

      // 6. Joyful Disco Lead Synth Hook
      // Ascends triumphantly as the vegetable spins and dances
      const leadMelody: { step: number; freq: number; dur: number }[] = [
        { step: 4, freq: 587.33, dur: 0.18 }, // D5
        { step: 6, freq: 659.25, dur: 0.18 }, // E5
        { step: 8, freq: 698.46, dur: 0.22 }, // F5
        { step: 11, freq: 880.0, dur: 0.24 }, // A5
        { step: 14, freq: 1046.5, dur: 0.26 }, // C6
        { step: 20, freq: 880.0, dur: 0.18 }, // A5
        { step: 22, freq: 987.77, dur: 0.18 }, // B5
        { step: 24, freq: 1046.5, dur: 0.22 }, // C6
        { step: 28, freq: 1174.66, dur: 0.45 }, // D6 high climax!
      ];

      leadMelody.forEach(({ step, freq, dur }) => {
        const t = now + step * step16th;
        const lOsc = this.ctx!.createOscillator();
        const lGain = this.ctx!.createGain();

        lOsc.type = 'sine';
        lOsc.frequency.setValueAtTime(freq, t);
        // Subtle disco vibrato
        lOsc.frequency.linearRampToValueAtTime(freq * 1.015, t + dur * 0.5);
        lOsc.frequency.linearRampToValueAtTime(freq, t + dur);

        lGain.gain.setValueAtTime(0.16, t);
        lGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        lOsc.connect(lGain);
        lGain.connect(discoGain);
        lOsc.start(t);
        lOsc.stop(t + dur);

        this.activeDiscoStoppers.push(() => {
          try {
            lOsc.stop();
          } catch {
            // ignore
          }
        });
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Toggle Cozy Garden Background Music (BGM)
   */
  public toggleBGM(): boolean {
    if (this.isBgmActive) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public isBGMPlaying(): boolean {
    return this.isBgmActive;
  }

  /**
   * Start Cozy Procedural Garden Soundtrack
   * Organic acoustic marimba, soft kalimba wooden tines, warm bass, and gentle chimes.
   */
  public startBGM() {
    this.initContext();
    if (!this.ctx) return;
    this.isBgmActive = true;

    if (!this.bgmMasterGain) {
      this.bgmMasterGain = this.ctx.createGain();
      this.bgmMasterGain.connect(this.ctx.destination);
    }
    this.bgmMasterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.26, this.ctx.currentTime);

    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
    }

    // Play an immediate bar, then schedule every 2.4 seconds
    this.playGardenBGMBar();
    this.bgmIntervalId = setInterval(() => {
      if (this.isBgmActive && !this.isMuted) {
        this.playGardenBGMBar();
      }
    }, 2400);
  }

  public stopBGM() {
    this.isBgmActive = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }
  }

  /**
   * Plays a cozy 4-beat bar of gentle organic garden music
   * (Pentatonic C / G warmth with soft wooden marimba notes)
   */
  private playGardenBGMBar() {
    if (!this.ctx || !this.bgmMasterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const stepDur = 0.3; // 8 notes per 2.4s bar

      // Garden chord progression: C -> G -> Am -> F
      const chordRoots = [130.81, 98.0, 110.0, 87.31]; // C3, G2, A2, F2
      const rootFreq = chordRoots[this.bgmStep % chordRoots.length];

      // 1. Warm plucked bass note on downbeat
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(rootFreq, now);
      bassGain.gain.setValueAtTime(0.25, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmMasterGain);
      bassOsc.start(now);
      bassOsc.stop(now + 1.2);

      // 2. Playful wooden Kalimba / Marimba melodic patterns
      // Pentatonic palette: C4 (261.6), D4 (293.7), E4 (329.6), G4 (392.0), A4 (440.0), C5 (523.3), E5 (659.3)
      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25];
      const patterns = [
        [0, 2, 4, 2, 3, 5, 4, 1],
        [2, 4, 6, 4, 2, 3, 1, 0],
        [4, 3, 2, 1, 2, 4, 5, 3],
        [5, 4, 2, 0, 1, 3, 4, 2],
      ];
      const currentPattern = patterns[this.bgmStep % patterns.length];

      currentPattern.forEach((scaleIdx, i) => {
        // Leave occasional gentle breath rests
        if (i === 3 && this.bgmStep % 2 === 1) return;
        const noteTime = now + i * stepDur;
        const noteFreq = scale[scaleIdx % scale.length];

        // Wooden marimba bar: fundamental + subtle high overtone
        const mOsc = this.ctx!.createOscillator();
        const mGain = this.ctx!.createGain();
        mOsc.type = 'sine';
        mOsc.frequency.setValueAtTime(noteFreq, noteTime);

        mGain.gain.setValueAtTime(0.18, noteTime);
        mGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.38);

        mOsc.connect(mGain);
        mGain.connect(this.bgmMasterGain!);
        mOsc.start(noteTime);
        mOsc.stop(noteTime + 0.4);

        // Soft wood click transient
        const clickOsc = this.ctx!.createOscillator();
        const clickGain = this.ctx!.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(noteFreq * 2.76, noteTime);
        clickGain.gain.setValueAtTime(0.06, noteTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.04);
        clickOsc.connect(clickGain);
        clickGain.connect(this.bgmMasterGain!);
        clickOsc.start(noteTime);
        clickOsc.stop(noteTime + 0.05);
      });

      // 3. Occasional glistening fairy windchime on every 4th bar
      if (this.bgmStep % 4 === 3) {
        const chimeNotes = [784.0, 1046.5, 1318.5, 1568.0];
        chimeNotes.forEach((cFreq, idx) => {
          const cTime = now + 1.2 + idx * 0.12;
          const cOsc = this.ctx!.createOscillator();
          const cGain = this.ctx!.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(cFreq, cTime);
          cGain.gain.setValueAtTime(0.09, cTime);
          cGain.gain.exponentialRampToValueAtTime(0.0001, cTime + 0.7);
          cOsc.connect(cGain);
          cGain.connect(this.bgmMasterGain!);
          cOsc.start(cTime);
          cOsc.stop(cTime + 0.7);
        });
      }

      this.bgmStep++;
    } catch {
      // Silently ignore
    }
  }

  /**
   * Heartbeat thumps (lub-dub)
   */
  public playHeartbeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const thumps = [0, 0.14, 0.7, 0.84, 1.4, 1.54];
      thumps.forEach((dt, i) => {
        if (!this.ctx) return;
        const t = now + dt;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = i % 2 === 0 ? 85 : 70;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.09);

        gain.gain.setValueAtTime(this.volume * (i % 2 === 0 ? 0.4 : 0.3), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Serene Zen meditation singing bowl chime
   */
  public playZen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const harmonics = [432, 864, 1296];
      harmonics.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = (this.volume * 0.25) / (idx + 1);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Serpentine Wiggle Wave sound
   */
  public playWiggle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      for (let i = 0; i < 6; i++) {
        const t = now + (i * 0.25);
        osc.frequency.linearRampToValueAtTime(i % 2 === 0 ? 520 : 320, t);
      }

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    } catch {
      // Silently ignore
    }
  }

  /**
   * Stop any actively playing Beatbox loops immediately
   */
  public stopBeatbox() {
    this.activeBeatboxStoppers.forEach((stopper) => stopper());
    this.activeBeatboxStoppers = [];
  }

  /**
   * Quirky Veggie Beatbox (full 3.2s rhythm matching the vegetable animation!)
   */
  public playBeatbox() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopBeatbox();

    try {
      const now = this.ctx.currentTime;
      // 3.2-second full 2-bar rhythmic human & veggie beatbox routine
      const pattern: { t: number; type: 'kick' | 'hat' | 'snare' | 'pop' | 'throat' | 'scratch' }[] = [
        // Bar 1 (0.0s - 1.6s): Energetic intro drop
        { t: 0.00, type: 'kick' },
        { t: 0.00, type: 'pop' },
        { t: 0.14, type: 'hat' },
        { t: 0.28, type: 'hat' },
        { t: 0.42, type: 'snare' },
        { t: 0.56, type: 'throat' },
        { t: 0.70, type: 'kick' },
        { t: 0.84, type: 'kick' },
        { t: 0.98, type: 'snare' },
        { t: 1.12, type: 'pop' },
        { t: 1.26, type: 'hat' },
        { t: 1.40, type: 'snare' },
        { t: 1.54, type: 'throat' },

        // Bar 2 (1.6s - 3.2s): Climax variation with scratches & rapid hi-hat rolls
        { t: 1.68, type: 'kick' },
        { t: 1.80, type: 'scratch' },
        { t: 1.94, type: 'hat' },
        { t: 2.06, type: 'snare' },
        { t: 2.18, type: 'throat' },
        { t: 2.30, type: 'kick' },
        { t: 2.42, type: 'kick' },
        { t: 2.54, type: 'scratch' },
        { t: 2.66, type: 'hat' },
        { t: 2.76, type: 'snare' },
        { t: 2.88, type: 'pop' },
        { t: 3.00, type: 'kick' },
        { t: 3.00, type: 'snare' },
      ];

      pattern.forEach(({ t: offset, type }) => {
        if (!this.ctx) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        let duration = 0.1;

        if (type === 'kick') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.exponentialRampToValueAtTime(36, t + 0.11);
          gain.gain.setValueAtTime(this.volume * 0.48, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          duration = 0.12;
        } else if (type === 'hat') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(1100, t);
          gain.gain.setValueAtTime(this.volume * 0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
          duration = 0.04;
        } else if (type === 'snare') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340, t);
          osc.frequency.exponentialRampToValueAtTime(95, t + 0.08);
          gain.gain.setValueAtTime(this.volume * 0.42, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          duration = 0.09;
        } else if (type === 'pop') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, t);
          osc.frequency.exponentialRampToValueAtTime(160, t + 0.05);
          gain.gain.setValueAtTime(this.volume * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          duration = 0.06;
        } else if (type === 'throat') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, t);
          osc.frequency.linearRampToValueAtTime(65, t + 0.1);
          gain.gain.setValueAtTime(this.volume * 0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
          duration = 0.11;
        } else if (type === 'scratch') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, t);
          osc.frequency.linearRampToValueAtTime(880, t + 0.04);
          osc.frequency.linearRampToValueAtTime(320, t + 0.08);
          gain.gain.setValueAtTime(this.volume * 0.16, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          duration = 0.09;
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duration);

        this.activeBeatboxStoppers.push(() => {
          try {
            osc.stop();
          } catch {
            // ignore
          }
        });
      });
    } catch {
      // Silently ignore
    }
  }
}

export const sound = new SoundSynthesizer();
