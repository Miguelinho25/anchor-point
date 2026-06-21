// Shared scroll progress readable by both DOM (GSAP) and WebGL (Three.js RAF)
// Module-level singleton — no React overhead, updated every frame by GSAP, read every frame by Three.js
let _progress = 0
let _ch02Progress = 0
let _ch03Progress = 0
let _ch04Progress = 0

export const scrollStore = {
  get progress() { return _progress },
  set progress(v: number) { _progress = v },

  get ch02Progress() { return _ch02Progress },
  set ch02Progress(v: number) { _ch02Progress = v },

  get ch03Progress() { return _ch03Progress },
  set ch03Progress(v: number) { _ch03Progress = v },

  get ch04Progress() { return _ch04Progress },
  set ch04Progress(v: number) { _ch04Progress = v },
}
