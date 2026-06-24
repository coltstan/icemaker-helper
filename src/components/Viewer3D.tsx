import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  useProgress,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import IceMakerModel, { REGION_FOCUS } from './IceMakerModel'
import GltfModel from './GltfModel'
import { SYSTEMS, SYSTEM_KEY } from '../data/systems'

// Falls back to the procedural model if a dropped-in GLB fails to load.
class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Parts behind the door — selecting one auto-opens the door to reveal it.
const INTERIOR_REGIONS = new Set([
  'evaporator-plate',
  'cutter-grid',
  'distributor-tube',
  'water-pan',
  'water-pump',
  'storage-bin',
  'bin-temp-sensor',
  'water-filter',
])

/** Smoothly flies the camera in to frame the selected part, then hands control
 *  back to the user. No-op until a part is selected. */
function CameraRig({ region }: { region: string | null }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const invalidate = useThree((s) => s.invalidate)
  const focusTarget = useRef(new THREE.Vector3())
  const camDest = useRef(new THREE.Vector3())
  const active = useRef(false)

  useEffect(() => {
    if (!controls || !region) return
    const f = REGION_FOCUS[region]
    if (!f) return
    const focus = new THREE.Vector3(f[0], f[1] + 0.05, f[2])
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target)
    if (dir.lengthSq() < 1e-4) dir.set(0.6, 0.4, 0.7)
    dir.normalize()
    focusTarget.current.copy(focus)
    camDest.current.copy(focus).addScaledVector(dir, 3.6)
    active.current = true
    invalidate()
  }, [region, controls, camera, invalidate])

  useFrame(() => {
    if (!active.current || !controls) return
    controls.target.lerp(focusTarget.current, 0.1)
    camera.position.lerp(camDest.current, 0.1)
    controls.update()
    if (
      controls.target.distanceTo(focusTarget.current) < 0.02 &&
      camera.position.distanceTo(camDest.current) < 0.02
    ) {
      active.current = false
    } else {
      invalidate()
    }
  })
  return null
}

/** Keeps requesting frames while the showcase auto-rotate is active (demand mode). */
function AutoSpin({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useFrame(() => {
    if (active) invalidate()
  })
  return null
}

interface Viewer3DProps {
  selectedRegion: string | null
  selectedName: string | null
  onSelect: (region: string | null) => void
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        pressed
          ? 'bg-accent-600 text-white shadow-sm'
          : 'bg-white/85 text-zinc-700 ring-1 ring-zinc-200 backdrop-blur hover:bg-white dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

/** Studio light rig rendered into the environment map — fully self-contained
 *  (no network HDR download), gives the stainless its soft reflections. */
function Studio() {
  return (
    <Environment resolution={384} frames={1}>
      <Lightformer intensity={3} position={[0, 5, -2]} scale={[14, 7, 1]} color="#ffffff" />
      <Lightformer intensity={1.6} position={[0, 1, 6]} scale={[14, 9, 1]} color="#eef3fb" />
      <Lightformer
        intensity={1.8}
        position={[-5, 1.5, 2]}
        rotation-y={Math.PI / 2}
        scale={[10, 9, 1]}
        color="#dfe7f2"
      />
      <Lightformer
        intensity={1.8}
        position={[5, 1.5, 2]}
        rotation-y={-Math.PI / 2}
        scale={[10, 9, 1]}
        color="#dfe7f2"
      />
      <Lightformer
        intensity={0.7}
        position={[0, -3, 2]}
        rotation-x={Math.PI / 2}
        scale={[12, 12, 1]}
        color="#ffffff"
      />
    </Environment>
  )
}

/** In demand mode the framebuffer can be cleared when the tab is backgrounded;
 *  repaint when it becomes visible again so users never return to a blank canvas. */
function RepaintOnVisible() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const onVisible = () => invalidate()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [invalidate])
  return null
}

/** Lightweight loading overlay shown while the studio environment compiles. */
function LoadingOverlay() {
  const { active } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-zinc-700">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-accent-600" />
        Loading model…
      </div>
    </div>
  )
}

// Load the <model-viewer> web component from its CDN on demand. It bundles its
// own copy of three, so this avoids a version clash with the app's three.
let modelViewerPromise: Promise<void> | null = null
function loadModelViewer(): Promise<void> {
  if (typeof customElements !== 'undefined' && customElements.get('model-viewer')) {
    return Promise.resolve()
  }
  if (modelViewerPromise) return modelViewerPromise
  modelViewerPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js'
    script.onload = () => customElements.whenDefined('model-viewer').then(() => resolve())
    script.onerror = () => {
      modelViewerPromise = null
      reject(new Error('Could not load the AR viewer — check your connection.'))
    }
    document.head.appendChild(script)
  })
  return modelViewerPromise
}

/** Exports the live model to GLB (+ USDZ for iOS) and shows it in <model-viewer>,
 *  which provides native "View in AR" on phones (Scene Viewer / WebXR / Quick Look). */
function ArModal({ object, onClose }: { object: THREE.Object3D | null; onClose: () => void }) {
  const [glb, setGlb] = useState<string | null>(null)
  const [usdz, setUsdz] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let glbUrl: string | undefined
    let usdzUrl: string | undefined
    let cancelled = false
    ;(async () => {
      try {
        if (!object) throw new Error('Model is still loading — close this and try again.')
        await loadModelViewer()
        const [{ GLTFExporter }, { USDZExporter }] = await Promise.all([
          import('three/examples/jsm/exporters/GLTFExporter.js'),
          import('three/examples/jsm/exporters/USDZExporter.js'),
        ])
        const glbBuf = await new Promise<ArrayBuffer>((resolve, reject) =>
          new GLTFExporter().parse(
            object,
            (r) => resolve(r as ArrayBuffer),
            (e) => reject(e),
            { binary: true },
          ),
        )
        if (cancelled) return
        glbUrl = URL.createObjectURL(new Blob([glbBuf], { type: 'model/gltf-binary' }))
        setGlb(glbUrl)
        try {
          // USDZExporter exposes parseAsync in some versions, parse in others.
          const exporter = new USDZExporter() as unknown as {
            parseAsync?: (o: THREE.Object3D) => Promise<Uint8Array>
            parse: (o: THREE.Object3D) => Promise<Uint8Array>
          }
          const usdzArr = await (exporter.parseAsync
            ? exporter.parseAsync(object)
            : exporter.parse(object))
          if (cancelled) return
          usdzUrl = URL.createObjectURL(new Blob([usdzArr as BlobPart], { type: 'model/vnd.usdz+zip' }))
          setUsdz(usdzUrl)
        } catch {
          /* iOS Quick Look export unavailable — Android/WebXR still work via GLB */
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
      if (glbUrl) URL.revokeObjectURL(glbUrl)
      if (usdzUrl) URL.revokeObjectURL(usdzUrl)
    }
  }, [object])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="View in your space"
      onClick={onClose}
    >
      <div
        className="card relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-700/60">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            View in your space
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
        <div className="relative flex-1">
          {error ? (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {error}
            </div>
          ) : glb ? (
            <model-viewer
              src={glb}
              ios-src={usdz ?? undefined}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              exposure="1"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-accent-600" />
              Preparing 3D model…
            </div>
          )}
        </div>
        <p className="border-t border-zinc-200/70 px-4 py-2.5 text-center text-xs text-zinc-500 dark:border-zinc-700/60 dark:text-zinc-400">
          On a phone, tap the <span className="font-medium">AR</span> button to place it in your
          room. Drag to rotate here.
        </p>
      </div>
    </div>
  )
}

export default function Viewer3D({ selectedRegion, selectedName, onSelect }: Viewer3DProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const modelRef = useRef<THREE.Group>(null)
  const [doorOpen, setDoorOpen] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [arOpen, setArOpen] = useState(false)
  const [glbUrl, setGlbUrl] = useState<string | null>(null)

  // Use a real model if one is present at public/model/icemaker.glb; otherwise
  // fall back to the procedural model (no 404 noise — we HEAD-check first).
  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}model/icemaker.glb`
    let alive = true
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        // Only treat it as a model if the host actually serves a file — dev
        // servers / SPA hosts answer missing paths with an HTML 200 fallback.
        const ct = r.headers.get('content-type') || ''
        if (alive && r.ok && !ct.includes('text/html')) setGlbUrl(url)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Selecting an interior part auto-opens the door so it's actually visible.
  useEffect(() => {
    if (selectedRegion && INTERIOR_REGIONS.has(selectedRegion)) setDoorOpen(true)
  }, [selectedRegion])

  function resetView() {
    controls.current?.reset()
    setDoorOpen(false)
    setExploded(false)
    onSelect(null)
  }

  // Idle showcase: slowly spin until the user engages with a specific part/view.
  const engaged = Boolean(selectedRegion) || doorOpen || exploded || arOpen

  return (
    <>
    <div className="elev-lg relative h-[58vh] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 ring-1 ring-zinc-200/70 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 dark:ring-zinc-700/60 lg:h-[72vh]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 52% at 50% 40%, rgba(255,255,255,0.22), transparent 72%)',
        }}
      />
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [4.4, 2.6, 5.2], fov: 32 }}
        gl={{ antialias: true, alpha: true, toneMappingExposure: 1.18 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
        }}
        aria-label="Interactive 3D model of the KUIX505ESS2 ice maker. Drag to rotate, scroll or pinch to zoom, and tap a part to see details."
        onPointerMissed={() => onSelect(null)}
      >
        <ambientLight intensity={0.38} />
        {/* Warm key */}
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.85}
          color="#fff4e8"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
        />
        {/* Cool fill + a cool rim from behind to carve the top/side edges */}
        <directionalLight position={[-6, 3, -3]} intensity={0.5} color="#eef3fb" />
        <directionalLight position={[0, 2, 7]} intensity={0.45} />
        <directionalLight position={[-4, 6, -6]} intensity={0.9} color="#cfe0ff" />
        <RepaintOnVisible />
        <AutoSpin active={!engaged} />
        <CameraRig region={glbUrl ? null : selectedRegion} />
        <Suspense fallback={null}>
          <Studio />
        </Suspense>
        <group ref={modelRef}>
          {glbUrl ? (
            <ModelErrorBoundary
              fallback={
                <IceMakerModel
                  selectedRegion={selectedRegion}
                  onSelect={onSelect}
                  doorOpen={doorOpen}
                  exploded={exploded}
                />
              }
            >
              <Suspense fallback={null}>
                <GltfModel url={glbUrl} targetHeight={3.4} />
              </Suspense>
            </ModelErrorBoundary>
          ) : (
            <IceMakerModel
              selectedRegion={selectedRegion}
              onSelect={onSelect}
              doorOpen={doorOpen}
              exploded={exploded}
            />
          )}
        </group>
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.68}
          scale={6.5}
          blur={2.6}
          far={4.5}
          resolution={1024}
          color="#000000"
        />
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!engaged}
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={11}
          maxPolarAngle={Math.PI * 0.52}
          makeDefault
        />
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.18}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <LoadingOverlay />

      {/* Control bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          {!glbUrl && (
            <>
              <Toggle pressed={doorOpen} onClick={() => setDoorOpen((v) => !v)}>
                {doorOpen ? 'Close door' : 'Open door'}
              </Toggle>
              <Toggle pressed={exploded} onClick={() => setExploded((v) => !v)}>
                Exploded view
              </Toggle>
            </>
          )}
          <button
            type="button"
            onClick={() => setArOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/85 px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 backdrop-blur transition-all duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 7v10l8 4 8-4V7z" />
              <path d="M4 7l8 4 8-4M12 11v10" />
            </svg>
            View in AR
          </button>
        </div>
        <button
          type="button"
          onClick={resetView}
          className="pointer-events-auto cursor-pointer rounded-lg bg-white/85 px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 backdrop-blur transition-all duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          Reset view
        </button>
      </div>

      {/* Colour key (hidden on small screens) */}
      <div className="pointer-events-none absolute bottom-3 left-3 hidden flex-wrap gap-x-3 gap-y-1 rounded-lg bg-white/75 px-2.5 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200/70 backdrop-blur sm:flex dark:bg-zinc-900/70 dark:text-zinc-300 dark:ring-zinc-700/60">
        {SYSTEM_KEY.map((g) => (
          <span key={g} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${SYSTEMS[g].dot}`} />
            {SYSTEMS[g].short}
          </span>
        ))}
      </div>

      {/* Selected-part caption */}
      {selectedName && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
          <span className="rounded-full bg-accent-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {selectedName}
          </span>
        </div>
      )}
      </div>
      {arOpen && <ArModal object={modelRef.current} onClose={() => setArOpen(false)} />}
    </>
  )
}
