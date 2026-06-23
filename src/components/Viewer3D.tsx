import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  useProgress,
} from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import IceMakerModel, { REGION_FOCUS } from './IceMakerModel'
import { SYSTEMS, SYSTEM_KEY } from '../data/systems'

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
    <Environment resolution={256} frames={1}>
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

export default function Viewer3D({ selectedRegion, selectedName, onSelect }: Viewer3DProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const [doorOpen, setDoorOpen] = useState(false)
  const [exploded, setExploded] = useState(false)

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

  return (
    <div className="elev-lg relative h-[58vh] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 ring-1 ring-zinc-200/70 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 dark:ring-zinc-700/60 lg:h-[72vh]">
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
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0002}
        />
        <directionalLight position={[-5, 3, -3]} intensity={0.5} />
        <directionalLight position={[0, 2, 7]} intensity={0.4} />
        <RepaintOnVisible />
        <CameraRig region={selectedRegion} />
        <Suspense fallback={null}>
          <Studio />
          <IceMakerModel
            selectedRegion={selectedRegion}
            onSelect={onSelect}
            doorOpen={doorOpen}
            exploded={exploded}
          />
        </Suspense>
        <ContactShadows
          position={[0, -1.78, 0]}
          opacity={0.45}
          scale={7}
          blur={2.6}
          far={4.5}
          resolution={1024}
          color="#0b1220"
        />
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={11}
          maxPolarAngle={Math.PI * 0.52}
          makeDefault
        />
      </Canvas>

      <LoadingOverlay />

      {/* Control bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <Toggle pressed={doorOpen} onClick={() => setDoorOpen((v) => !v)}>
            {doorOpen ? 'Close door' : 'Open door'}
          </Toggle>
          <Toggle pressed={exploded} onClick={() => setExploded((v) => !v)}>
            Exploded view
          </Toggle>
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

      {/* Selected-part caption / hint */}
      {selectedName ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
          <span className="rounded-full bg-accent-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {selectedName}
          </span>
        </div>
      ) : (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-3 text-center text-xs font-medium text-zinc-500/90 dark:text-zinc-400/90 lg:block">
          Drag to rotate · scroll / pinch to zoom · tap a part for details
        </p>
      )}
    </div>
  )
}
