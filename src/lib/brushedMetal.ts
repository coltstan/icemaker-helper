import * as THREE from 'three'

// Procedurally generated brushed-stainless maps (PrintShield finish): a fine
// directional grain in the roughness + a faint matching normal perturbation.
// This is what makes flat metal panels catch the studio light like real
// brushed steel instead of reading as flat plastic. Built once, shared by every
// stainless material, and cached so React StrictMode's double render is cheap.
let cached: { roughnessMap: THREE.Texture; normalMap: THREE.Texture } | null = null

export function brushedMetalMaps() {
  if (cached) return cached
  const size = 512

  // Roughness: bright base (so the material's own roughness stays in control)
  // with thousands of fine vertical streaks that dip the value slightly.
  const rc = document.createElement('canvas')
  rc.width = rc.height = size
  const r = rc.getContext('2d')!
  r.fillStyle = '#e8e8e8'
  r.fillRect(0, 0, size, size)
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const len = size * (0.3 + Math.random() * 0.7)
    const v = Math.floor(150 + Math.random() * 105)
    r.strokeStyle = `rgba(${v},${v},${v},0.35)`
    r.lineWidth = Math.random() * 1.4 + 0.25
    r.beginPath()
    r.moveTo(x, y)
    r.lineTo(x, y + len)
    r.stroke()
  }
  const roughnessMap = new THREE.CanvasTexture(rc)

  // Normal: mostly flat (#8080ff) with a faint tangent (red-channel) wobble
  // along the same grain, so the brush lines pick up micro highlights.
  const nc = document.createElement('canvas')
  nc.width = nc.height = size
  const n = nc.getContext('2d')!
  n.fillStyle = '#8080ff'
  n.fillRect(0, 0, size, size)
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const len = size * (0.3 + Math.random() * 0.7)
    const rx = Math.floor(118 + Math.random() * 20)
    n.strokeStyle = `rgba(${rx},128,255,0.4)`
    n.lineWidth = Math.random() * 1.2 + 0.2
    n.beginPath()
    n.moveTo(x, y)
    n.lineTo(x, y + len)
    n.stroke()
  }
  const normalMap = new THREE.CanvasTexture(nc)

  for (const t of [roughnessMap, normalMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2.5, 2.5)
    t.anisotropy = 8
    t.needsUpdate = true
  }

  cached = { roughnessMap, normalMap }
  return cached
}
