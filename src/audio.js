// ============================================
// AUDIO SYSTEM - Procedural Sound Effects
// ============================================

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVolume = 0.3;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _playTone(freq, duration, type, volume, attack, decay) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * this.masterVolume, now + (attack || 0.01));
        gain.gain.linearRampToValueAtTime(0, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    _playNoise(duration, volume, filterFreq, filterType) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType || 'lowpass';
        filter.frequency.setValueAtTime(filterFreq || 2000, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(now);
        source.stop(now + duration);
    }

    shootRevolver() {
        this._playNoise(0.15, 0.5, 3000, 'highpass');
        this._playTone(150, 0.1, 'sawtooth', 0.3, 0.005, 0.1);
    }

    shootShotgun() {
        this._playNoise(0.25, 0.7, 1500, 'lowpass');
        this._playTone(80, 0.15, 'sawtooth', 0.4, 0.005, 0.15);
    }

    shootRifle() {
        this._playNoise(0.2, 0.5, 2500, 'bandpass');
        this._playTone(200, 0.12, 'sawtooth', 0.3, 0.005, 0.12);
    }

    throwDynamite() {
        this._playTone(300, 0.1, 'sine', 0.2, 0.01, 0.1);
    }

    explosion() {
        this._playNoise(0.6, 0.8, 800, 'lowpass');
        this._playTone(40, 0.5, 'sine', 0.5, 0.01, 0.5);
        this._playTone(60, 0.4, 'sawtooth', 0.3, 0.05, 0.4);
    }

    jump() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        gain.gain.setValueAtTime(0.15 * this.masterVolume, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    hit() {
        this._playNoise(0.1, 0.4, 1200, 'lowpass');
        this._playTone(100, 0.1, 'square', 0.2, 0.005, 0.1);
    }

    death() {
        this._playTone(300, 0.15, 'square', 0.25, 0.01, 0.15);
        setTimeout(() => this._playTone(200, 0.15, 'square', 0.25, 0.01, 0.15), 150);
        setTimeout(() => this._playTone(100, 0.4, 'square', 0.3, 0.01, 0.4), 300);
    }

    coinCollect() {
        this._playTone(880, 0.08, 'square', 0.2, 0.005, 0.08);
        setTimeout(() => this._playTone(1320, 0.12, 'square', 0.2, 0.005, 0.12), 80);
    }

    itemCollect() {
        this._playTone(660, 0.08, 'sine', 0.2, 0.005, 0.08);
        setTimeout(() => this._playTone(880, 0.08, 'sine', 0.2, 0.005, 0.08), 80);
        setTimeout(() => this._playTone(1100, 0.12, 'sine', 0.2, 0.005, 0.12), 160);
    }

    phaseComplete() {
        const notes = [440, 554, 660, 880];
        notes.forEach((n, i) => {
            setTimeout(() => this._playTone(n, 0.2, 'square', 0.25, 0.01, 0.2), i * 150);
        });
    }

    gameOver() {
        const notes = [440, 370, 330, 220];
        notes.forEach((n, i) => {
            setTimeout(() => this._playTone(n, 0.3, 'square', 0.3, 0.01, 0.3), i * 250);
        });
    }

    enemyDeath() {
        this._playTone(250, 0.08, 'sawtooth', 0.15, 0.005, 0.08);
        this._playTone(120, 0.15, 'sawtooth', 0.15, 0.02, 0.15);
    }

    horseGallop() {
        this._playNoise(0.05, 0.1, 600, 'lowpass');
    }

    punch() {
        this._playNoise(0.08, 0.3, 1000, 'lowpass');
    }

    weaponSwitch() {
        this._playTone(600, 0.05, 'sine', 0.15, 0.005, 0.05);
        this._playTone(800, 0.05, 'sine', 0.15, 0.01, 0.05);
    }

    menuSelect() {
        this._playTone(440, 0.08, 'square', 0.15, 0.005, 0.08);
    }

    menuConfirm() {
        this._playTone(660, 0.06, 'square', 0.15, 0.005, 0.06);
        setTimeout(() => this._playTone(880, 0.1, 'square', 0.2, 0.005, 0.1), 60);
    }
}

const SFX = new AudioManager();
