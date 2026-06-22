import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
} from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import IceMakerModel from './IceMakerModel'

interface Viewer3DProps {
  selectedRegion: string | null
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
      {/* large soft key overhead */}
      <Lightformer intensity={3} position={[0, 5, -2]} scale={[14, 7, 1]} color="#ffffff" />
      {/* broad front fill so faces toward the camera read as bright metal */}
      <Lightformer intensity={1.6} position={[0, 1, 6]} scale={[14, 9, 1]} color="#eef3fb" />
      {/* side wraps */}
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
      <Lightformer intensity={0.7} position={[0, -3, 2]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#ffffff" />
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

export default function Viewer3D({ selectedRegion, onSelect }: Viewer3DProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const [doorOpen, setDoorOpen] = useState(false)
  const [exploded, setExploded] = useState(false)

  return (
    <div className="relative h-[58vh] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 ring-1 ring-zinc-200/70 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 dark:ring-zinc-700/60 lg:h-[72vh]">
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
          onClick={() => controls.current?.reset()}
          className="pointer-events-auto cursor-pointer rounded-lg bg-white/85 px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 backdrop-blur transition-all duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          Reset view
        </button>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-center text-xs font-medium text-zinc-500/90 dark:text-zinc-400/90">
        Drag to rotate · scroll / pinch to zoom · tap a part for details
      </p>
    </div>
  )
}
