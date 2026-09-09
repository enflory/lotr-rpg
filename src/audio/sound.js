// Tiny WebAudio chiptune engine — looping pattern music plus SFX.
// Everything is synthesized; there are no audio assets.
//
// Call initAudio() from a user-gesture handler before anything else
// (browser autoplay policy). All functions no-op safely before init.

let ctx = null;
let master = null;
let musicGain = null;
let muted = false;

let current = { id: null, timer: null, nextBarTime: 0 };

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

function tone(midi, t, dur, type, vol, dest) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq(midi);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.setValueAtTime(vol, t + dur * 0.6);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* ── music ──────────────────────────────────────────────── */
// A song is { bpm, beats, tracks: [{ type, vol, notes: [[beat, midi, lenBeats], ...] }] }

const SONGS = {
  // Original chapter motifs: damp unease, a dancing refuge, wind, cold stone.
  oldforest: {
    bpm: 76, beats: 16,
    tracks: [
      { type: 'triangle', vol: 0.48, notes: [[0,57,2],[3,60,1],[5,59,3],[9,53,2],[12,57,2],[15,56,1]] },
      { type: 'sine', vol: 0.34, notes: [[0,33,7],[8,40,3],[12,38,4]] },
    ],
  },
  bombadil: {
    bpm: 138, beats: 12,
    tracks: [
      { type: 'triangle', vol: 0.7, notes: [[0,74,0.5],[0.5,69,0.5],[1,71,1],[2,78,1],[3,76,1.5],[4.5,71,0.5],[5,69,1],[6,66,1],[7,74,0.5],[7.5,76,0.5],[8,71,1],[9,69,1],[10,74,2]] },
      { type: 'sine', vol: 0.45, notes: [[0,50,1],[1,57,2],[3,47,1],[4,54,2],[6,43,1],[7,50,2],[9,50,3]] },
    ],
  },
  downs: {
    bpm: 64, beats: 16,
    tracks: [
      { type: 'sine', vol: 0.6, notes: [[0,74,3],[4,69,2],[7,72,2],[11,65,3],[15,67,1]] },
      { type: 'triangle', vol: 0.2, notes: [[0,38,6],[8,41,6]] },
    ],
  },
  barrow: {
    bpm: 54, beats: 16,
    tracks: [
      { type: 'sine', vol: 0.48, notes: [[0,31,7],[8,30,7]] },
      { type: 'triangle', vol: 0.22, notes: [[1,55,3],[6,56,2],[10,50,3],[14,49,2]] },
    ],
  },
  // Pastoral, lilting 3/4 — G major pentatonic
  shire: {
    bpm: 152, beats: 24,
    tracks: [
      {
        type: 'triangle', vol: 0.9,
        notes: [
          [0, 67, 1], [1, 71, 1], [2, 74, 1],
          [3, 76, 1.5], [4.5, 74, 0.5], [5, 71, 1],
          [6, 69, 2.5], [9, 67, 1], [10, 69, 1], [11, 71, 1],
          [12, 74, 1.5], [13.5, 71, 0.5], [14, 69, 1],
          [15, 67, 2.5], [18, 64, 1], [19, 67, 1], [20, 69, 1],
          [21, 67, 3],
        ],
      },
      {
        type: 'square', vol: 0.22,
        notes: [
          [0, 43, 1], [1, 50, 1], [2, 47, 1],
          [3, 48, 1], [4, 52, 1], [5, 48, 1],
          [6, 45, 1], [7, 52, 1], [8, 45, 1],
          [9, 43, 1], [10, 50, 1], [11, 47, 1],
          [12, 43, 1], [13, 50, 1], [14, 47, 1],
          [15, 48, 1], [16, 52, 1], [17, 48, 1],
          [18, 40, 1], [19, 47, 1], [20, 45, 1],
          [21, 43, 2],
        ],
      },
    ],
  },

  // Sparse, watchful E minor — the woods at dusk
  forest: {
    bpm: 100, beats: 16,
    tracks: [
      {
        type: 'triangle', vol: 0.8,
        notes: [
          [0, 64, 2], [2, 67, 1], [3, 71, 3],
          [7, 69, 1], [8, 67, 2], [10, 64, 3],
          [14, 62, 2],
        ],
      },
      {
        type: 'sine', vol: 0.5,
        notes: [
          [0, 40, 4], [4, 43, 4], [8, 45, 4], [12, 40, 4],
        ],
      },
    ],
  },

  // Cozy hearthside waltz
  interior: {
    bpm: 132, beats: 12,
    tracks: [
      {
        type: 'triangle', vol: 0.7,
        notes: [
          [0, 72, 1], [1, 76, 1], [2, 79, 1],
          [3, 76, 1], [4, 72, 1], [5, 74, 1],
          [6, 76, 2], [8, 74, 1], [9, 72, 2.5],
        ],
      },
      {
        type: 'sine', vol: 0.55,
        notes: [
          [0, 48, 3], [3, 43, 3], [6, 45, 3], [9, 48, 3],
        ],
      },
    ],
  },
};

function scheduleBar(song) {
  const spb = 60 / song.bpm;
  const t0 = current.nextBarTime;
  for (const track of song.tracks) {
    for (const [beat, midi, len] of track.notes) {
      tone(midi, t0 + beat * spb, len * spb, track.type, track.vol, musicGain);
    }
  }
  current.nextBarTime = t0 + song.beats * spb;
}

export function playMusic(id) {
  if (!ctx) return;
  if (current.id === id) return;
  stopMusic();
  const song = SONGS[id];
  if (!song) return;
  current.id = id;
  current.nextBarTime = ctx.currentTime + 0.1;
  scheduleBar(song);
  current.timer = setInterval(() => {
    // Keep one bar scheduled ahead
    if (ctx.currentTime > current.nextBarTime - 1.0) scheduleBar(song);
  }, 250);
}

export function stopMusic() {
  if (current.timer) clearInterval(current.timer);
  current = { id: null, timer: null, nextBarTime: 0 };
}

/* ── sfx ────────────────────────────────────────────────── */

export const sfx = {
  blip() {
    if (!ctx) return;
    tone(93 + Math.floor(Math.random() * 3), ctx.currentTime, 0.03, 'square', 0.06, master);
  },
  confirm() {
    if (!ctx) return;
    tone(76, ctx.currentTime, 0.05, 'square', 0.12, master);
    tone(83, ctx.currentTime + 0.05, 0.08, 'square', 0.12, master);
  },
  door() {
    if (!ctx) return;
    tone(45, ctx.currentTime, 0.09, 'triangle', 0.5, master);
    tone(38, ctx.currentTime + 0.08, 0.12, 'triangle', 0.45, master);
  },
  jingle() {
    if (!ctx) return;
    const t = ctx.currentTime;
    [[0, 74], [0.09, 78], [0.18, 81], [0.27, 86]].forEach(([dt, m]) =>
      tone(m, t + dt, 0.22, 'triangle', 0.4, master));
  },
  sting() {
    if (!ctx) return;
    const t = ctx.currentTime;
    tone(38, t, 0.5, 'sawtooth', 0.25, master);
    tone(44, t, 0.5, 'sawtooth', 0.22, master);
    tone(37, t + 0.5, 0.9, 'sawtooth', 0.28, master);
    tone(43, t + 0.5, 0.9, 'sawtooth', 0.24, master);
  },
  elfsong() {
    if (!ctx) return;
    const t = ctx.currentTime;
    [[0, 76], [0.3, 80], [0.6, 83], [0.9, 88], [1.4, 83], [1.9, 88]].forEach(([dt, m]) =>
      tone(m, t + dt, 0.7, 'triangle', 0.22, master));
  },
};

// Chapter 3: the wight's cold chant, Frodo's answering verse, breaking stone.
sfx.chant = () => {
  if (!ctx) return;
  const t = ctx.currentTime;
  [[0, 33], [0.55, 32], [1.1, 35], [1.7, 31]].forEach(([dt, m]) =>
    tone(m, t + dt, 0.75, 'sawtooth', 0.16, master));
  [[0, 56], [0.55, 55], [1.1, 58]].forEach(([dt, m]) =>
    tone(m, t + dt, 0.7, 'sine', 0.07, master));
};
sfx.hymn = () => {
  if (!ctx) return;
  const t = ctx.currentTime;
  [[0, 69, 0.42], [0.4, 72, 0.42], [0.8, 74, 0.42], [1.2, 76, 0.7], [1.9, 74, 0.5], [2.4, 71, 0.9]]
    .forEach(([dt, m, len]) => tone(m, t + dt, len, 'triangle', 0.3, master));
  [[0, 45], [1.2, 50], [2.4, 47]].forEach(([dt, m]) =>
    tone(m, t + dt, 1.1, 'sine', 0.16, master));
};
sfx.crack = () => {
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(28, t, 0.7, 'square', 0.22, master);
  tone(35, t + 0.12, 0.5, 'sawtooth', 0.18, master);
  [[0.3, 81], [0.42, 86], [0.55, 90]].forEach(([dt, m]) =>
    tone(m, t + dt, 0.5, 'triangle', 0.24, master));
};
