import { useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCursor, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { brushedMetalMaps } from '../lib/brushedMetal'

// Short labels shown on each part in exploded view, and approximate world
// positions used by the camera to frame a selected part (see Viewer3D).
export const REGION_LABELS: Record<string, string> = {
  condenser: 'Condenser coil',
  'condenser-fan': 'Condenser fan',
  compressor: 'Compressor',
  'evaporator-plate': 'Evaporator',
  'cutter-grid': 'Cutter grid',
  'distributor-tube': 'Fill / distributor',
  'water-pan': 'Water pan',
  'water-pump': 'Water pump',
  'storage-bin': 'Storage bin',
  'bin-temp-sensor': 'Bin sensor',
  'water-filter': 'Water filter',
  'control-board': 'Control board',
  'water-inlet-valve': 'Inlet valve',
}

export const REGION_FOCUS: Record<string, [number, number, number]> = {
  condenser: [0, 1.39, 0.16],
  'condenser-fan': [-0.36, 1.35, -0.55],
  compressor: [0.42, 1.23, -0.72],
  'evaporator-plate': [0, 0.71, -0.4],
  'cutter-grid': [0, 0.51, -0.4],
  'distributor-tube': [-0.34, 0.53, -0.62],
  'water-pan': [-0.3, 0.1, -0.6],
  'water-pump': [0.32, 0.13, -0.6],
  'storage-bin': [0, -1.07, 0.05],
  'bin-temp-sensor': [0.54, 0.27, -0.5],
  'water-filter': [0.46, 1.05, 0.78],
  'control-board': [-0.42, 1.21, -1.05],
  'water-inlet-valve': [0.32, -1.4, -1.18],
}

// ---------------------------------------------------------------------------
// Stylised but high-fidelity representation of the KUIX505ESS2 15" ice maker,
// built from primitives and tuned to the owner's reference photos:
//  - brushed-stainless door with a top tubular bar handle + KitchenAid badge
//  - louvered top grille hiding the sealed system
//  - white interior liner with evaporator plate, fine wire cutter grid,
//    water distribution tray, and a water pan with a black square drain cap.
//
// SWAP IN A REAL GLTF LATER: each major component is wrapped in <Selectable
// id="...">; replace the primitive meshes inside with the matching GLTF node
// (keep the id so click-to-select / highlight still work, and keep the region
// ids in data/parts.ts in sync). See README.
// ---------------------------------------------------------------------------

const ACCENT = '#e23d4d'

// True proportions of the KUIX505ESS2: 14.87"W × 34.38"H × 25.63"D.
// Scaled so W = 1.5 → H ≈ 3.47, D ≈ 2.59 (a deep, tall cabinet).
const W = 1.5
const H = 3.47
const D = 2.59
const WALL = 0.05

type Vec3 = [number, number, number]

// Reusable physically-tuned materials. metalness/roughness + envMapIntensity
// read off the studio environment set up in Viewer3D.
const PRESETS = {
  // PrintShield = satin/brushed stainless: reflective but not mirror.
  stainless: { color: '#c6cbcf', metalness: 1, roughness: 0.47, envMapIntensity: 0.85 },
  stainlessDark: { color: '#9aa0a6', metalness: 1, roughness: 0.52, envMapIntensity: 0.8 },
  // Polished chrome for the handle — deliberately brighter than the satin door.
  chrome: { color: '#eaedf0', metalness: 1, roughness: 0.13, envMapIntensity: 1.45 },
  // Cool steel for the evaporator so it reads against the white liner.
  steel: { color: '#8f9dac', metalness: 1, roughness: 0.4, envMapIntensity: 0.9 },
  // Darker wire so the cutter grid and coil fins are clearly visible on white.
  wire: { color: '#6f7b88', metalness: 1, roughness: 0.32, envMapIntensity: 1.0 },
  whitePlastic: { color: '#eef1f3', metalness: 0, roughness: 0.5 },
  whitePlasticDim: { color: '#dbe0e4', metalness: 0, roughness: 0.62 },
  // Water-system parts: a bold, slightly warm blue so they pop on the white liner.
  waterBlue: { color: '#2f8fe0', metalness: 0, roughness: 0.4 },
  waterBlueDim: { color: '#62b0ee', metalness: 0, roughness: 0.48 },
  // Controls (sensor, boards) read green to match the system colour key.
  control: { color: '#1f9d57', metalness: 0.3, roughness: 0.45 },
  blackPlastic: { color: '#202327', metalness: 0.25, roughness: 0.45 },
  darkMetal: { color: '#33373d', metalness: 0.85, roughness: 0.4 },
  copper: { color: '#c47a3c', metalness: 1, roughness: 0.34, envMapIntensity: 1.1 },
  badge: { color: '#15181c', metalness: 0.5, roughness: 0.35 },
} as const

type Preset = keyof typeof PRESETS

// Large flat stainless surfaces get the brushed grain; small detail parts
// (chrome, wire, copper) stay clean so the finish reads as deliberate.
const BRUSHED_PRESETS = new Set<Preset>(['stainless', 'stainlessDark', 'steel'])
const BRUSHED_NORMAL_SCALE = new THREE.Vector2(0.14, 0.14)

function Mat({ preset, hl }: { preset: Preset; hl: boolean }) {
  const maps = BRUSHED_PRESETS.has(preset) ? brushedMetalMaps() : null
  return (
    <meshStandardMaterial
      {...PRESETS[preset]}
      {...(maps && {
        roughnessMap: maps.roughnessMap,
        normalMap: maps.normalMap,
        normalScale: BRUSHED_NORMAL_SCALE,
      })}
      emissive={hl ? ACCENT : '#000000'}
      emissiveIntensity={hl ? 0.45 : 0}
    />
  )
}

interface SelectableProps {
  id: string
  base: Vec3
  explodeTo?: Vec3
  explodeRef: React.MutableRefObject<number>
  selectedRegion: string | null
  onSelect: (region: string | null) => void
  children: (highlighted: boolean) => ReactNode
}

function Selectable({
  id,
  base,
  explodeTo,
  explodeRef,
  selectedRegion,
  onSelect,
  children,
}: SelectableProps) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const isSelected = selectedRegion === id
  const to = explodeTo ?? base

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const t = explodeRef.current
    g.position.set(
      base[0] + (to[0] - base[0]) * t,
      base[1] + (to[1] - base[1]) * t,
      base[2] + (to[2] - base[2]) * t,
    )
  })

  return (
    <group
      ref={ref}
      position={base}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children(isSelected || hovered)}
      {(hovered || isSelected) && REGION_LABELS[id] && (
        <Html center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className={`-translate-y-3 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-lg ring-1 backdrop-blur ${
              isSelected
                ? 'bg-accent-600 text-white ring-white/25'
                : 'bg-zinc-900/85 text-white ring-white/10'
            }`}
          >
            {REGION_LABELS[id]}
          </div>
        </Html>
      )}
    </group>
  )
}

interface ModelProps {
  selectedRegion: string | null
  onSelect: (region: string | null) => void
  doorOpen: boolean
  exploded: boolean
}

export default function IceMakerModel({
  selectedRegion,
  onSelect,
  doorOpen,
  exploded,
}: ModelProps) {
  const explodeRef = useRef(0)
  const doorGroup = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)

  // frameloop is "demand": keep requesting frames only while animating.
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 6)
    let animating = false

    const targetE = exploded ? 1 : 0
    explodeRef.current += (targetE - explodeRef.current) * k
    if (Math.abs(targetE - explodeRef.current) > 0.001) animating = true
    else explodeRef.current = targetE

    if (doorGroup.current) {
      const targetD = doorOpen ? -2.0 : 0
      const d = doorGroup.current
      d.rotation.y += (targetD - d.rotation.y) * k
      if (Math.abs(targetD - d.rotation.y) > 0.001) animating = true
      else d.rotation.y = targetD
    }

    if (animating) invalidate()
  })

  const sel = { explodeRef, selectedRegion, onSelect }

  return (
    <group position={[0, 0.05, 0]}>
      {/* ===== Cabinet shell (open front; eased-edge stainless panels) ===== */}
      <group>
        {/* back, sides, top, bottom — rounded edges so corners catch light */}
        <RoundedBox args={[W, H, WALL]} radius={0.02} smoothness={4} position={[0, 0, -D / 2]} castShadow receiveShadow>
          <Mat preset="stainlessDark" hl={false} />
        </RoundedBox>
        <RoundedBox args={[WALL, H, D]} radius={0.02} smoothness={4} position={[-W / 2, 0, 0]} castShadow receiveShadow>
          <Mat preset="stainless" hl={false} />
        </RoundedBox>
        <RoundedBox args={[WALL, H, D]} radius={0.02} smoothness={4} position={[W / 2, 0, 0]} castShadow receiveShadow>
          <Mat preset="stainless" hl={false} />
        </RoundedBox>
        {/* eased stainless top cap (slight overhang, rounded edges) */}
        <RoundedBox
          args={[W + 0.03, 0.09, D + 0.03]}
          radius={0.03}
          smoothness={4}
          position={[0, H / 2 - 0.01, 0]}
          castShadow
          receiveShadow
        >
          <Mat preset="stainless" hl={false} />
        </RoundedBox>
        <RoundedBox args={[W, WALL, D]} radius={0.018} smoothness={4} position={[0, -H / 2, 0]} receiveShadow>
          <Mat preset="stainlessDark" hl={false} />
        </RoundedBox>
        {/* recessed toe kick across the front bottom */}
        <mesh position={[0, -H / 2 + 0.09, D / 2 - 0.05]}>
          <boxGeometry args={[W - 0.06, 0.18, 0.04]} />
          <meshStandardMaterial color="#24272b" metalness={0.4} roughness={0.7} />
        </mesh>
        {/* leveling feet */}
        {[
          [-W / 2 + 0.16, D / 2 - 0.18],
          [W / 2 - 0.16, D / 2 - 0.18],
          [-W / 2 + 0.16, -D / 2 + 0.18],
          [W / 2 - 0.16, -D / 2 + 0.18],
        ].map((p, i) => (
          <mesh key={`foot${i}`} position={[p[0], -H / 2 - 0.035, p[1]]} castShadow>
            <cylinderGeometry args={[0.05, 0.062, 0.07, 18]} />
            <Mat preset="blackPlastic" hl={false} />
          </mesh>
        ))}

        {/* White interior liner (open box) — matches the photos */}
        <group>
          <mesh position={[0, -0.1, -D / 2 + 0.12]}>
            <boxGeometry args={[W - 0.16, H - 0.7, WALL]} />
            <Mat preset="whitePlastic" hl={false} />
          </mesh>
          <mesh position={[-W / 2 + 0.12, -0.1, 0.1]}>
            <boxGeometry args={[WALL, H - 0.7, D - 0.4]} />
            <Mat preset="whitePlastic" hl={false} />
          </mesh>
          <mesh position={[W / 2 - 0.12, -0.1, 0.1]}>
            <boxGeometry args={[WALL, H - 0.7, D - 0.4]} />
            <Mat preset="whitePlastic" hl={false} />
          </mesh>
          <mesh position={[0, -H / 2 + 0.14, 0.1]}>
            <boxGeometry args={[W - 0.16, WALL, D - 0.4]} />
            <Mat preset="whitePlastic" hl={false} />
          </mesh>
        </group>

        {/* Stainless face frame around the door opening */}
        <FaceFrame />
      </group>

      {/* ===== Top louvered vent (sealed system lives behind it) ===== */}
      <group position={[0, H / 2 - 0.32, D / 2 - 0.03]}>
        {/* surrounding stainless housing */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[W - 0.05, 0.44, 0.05]} />
          <Mat preset="stainlessDark" hl={false} />
        </mesh>
        {/* dark recess behind the louvers */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[W - 0.16, 0.37, 0.02]} />
          <meshStandardMaterial color="#141719" metalness={0.3} roughness={0.85} />
        </mesh>
        {/* angled satin louvers */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[0, 0.185 - i * 0.044, 0.01]} rotation={[-0.5, 0, 0]} castShadow>
            <boxGeometry args={[W - 0.15, 0.03, 0.016]} />
            <Mat preset="stainless" hl={false} />
          </mesh>
        ))}
        {/* corner screws */}
        {[
          [-(W / 2) + 0.09, 0.19],
          [W / 2 - 0.09, 0.19],
          [-(W / 2) + 0.09, -0.19],
          [W / 2 - 0.09, -0.19],
        ].map((p, i) => (
          <mesh key={`vs${i}`} position={[p[0], p[1], 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
            <Mat preset="darkMetal" hl={false} />
          </mesh>
        ))}
      </group>

      {/* Sealed-compartment floor: separates the sealed system (above, behind
          the grille) from the ice storage compartment below. */}
      <mesh position={[0, 0.92, -0.05]}>
        <boxGeometry args={[W - 0.16, WALL, D - 0.32]} />
        <Mat preset="whitePlasticDim" hl={false} />
      </mesh>

      {/* ===== Sealed-system components behind the grille (top compartment) ===== */}
      <Selectable id="condenser" base={[0, 1.34, 0.16]} explodeTo={[0, 2.75, 0.16]} {...sel}>
        {(hl) => (
          <group>
            {/* coil pack */}
            <mesh castShadow>
              <boxGeometry args={[1.18, 0.52, 0.2]} />
              <Mat preset="stainlessDark" hl={hl} />
            </mesh>
            {/* aluminium fins */}
            {Array.from({ length: 18 }).map((_, i) => (
              <mesh key={i} position={[-0.56 + i * 0.066, 0, 0.11]}>
                <boxGeometry args={[0.012, 0.5, 0.03]} />
                <Mat preset="wire" hl={hl} />
              </mesh>
            ))}
            {/* copper return bends on top */}
            <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 1.1, 20]} />
              <Mat preset="copper" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      <Selectable id="condenser-fan" base={[-0.36, 1.3, -0.55]} explodeTo={[-2.0, 1.3, -0.55]} {...sel}>
        {(hl) => (
          <group>
            {/* shroud */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.1, 28, 1, true]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            {/* motor hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.11, 0.24, 24]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            {/* blades */}
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh
                key={i}
                rotation={[0, 0, (i / 5) * Math.PI * 2]}
                position={[0, 0, 0.06]}
              >
                <boxGeometry args={[0.3, 0.1, 0.012]} />
                <Mat preset="blackPlastic" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      <Selectable id="compressor" base={[0.42, 1.18, -0.72]} explodeTo={[2.1, 1.05, -0.72]} {...sel}>
        {(hl) => (
          <group>
            <mesh castShadow rotation={[0, 0, 0.04]}>
              <cylinderGeometry args={[0.27, 0.3, 0.46, 32]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            {/* dome top */}
            <mesh position={[0, 0.27, 0]}>
              <sphereGeometry args={[0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            {/* overload puck */}
            <mesh position={[0.18, 0.05, 0.22]}>
              <boxGeometry args={[0.12, 0.1, 0.08]} />
              <Mat preset="blackPlastic" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* ===== Interior (revealed when the door opens) — matched to the unit ===== */}
      {/* Evaporator: hangs under the sealed floor; round ice-mold cups face down */}
      <Selectable id="evaporator-plate" base={[0, 0.66, -0.4]} explodeTo={[0, 1.7, 0.7]} {...sel}>
        {(hl) => (
          <group>
            {/* steel evaporator housing */}
            <mesh castShadow>
              <boxGeometry args={[1.0, 0.16, 0.58]} />
              <Mat preset="steel" hl={hl} />
            </mesh>
            {/* front channel rail */}
            <mesh position={[0, -0.02, 0.3]}>
              <boxGeometry args={[1.02, 0.2, 0.04]} />
              <Mat preset="stainlessDark" hl={hl} />
            </mesh>
            {/* row of round mold cups on the underside */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[-0.4 + i * 0.16, -0.13, 0.0]}>
                <cylinderGeometry args={[0.062, 0.062, 0.12, 28]} />
                <Mat preset="chrome" hl={hl} />
              </mesh>
            ))}
            {/* harvest finger slots on the front face */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={`f${i}`} position={[-0.4 + i * 0.16, 0.0, 0.31]}>
                <boxGeometry args={[0.05, 0.06, 0.02]} />
                <Mat preset="blackPlastic" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      {/* Cutter grid: horizontal wire grid just below the evaporator */}
      <Selectable id="cutter-grid" base={[0, 0.46, -0.4]} explodeTo={[0, 0.46, 1.25]} {...sel}>
        {(hl) => <CutterGrid hl={hl} />}
      </Selectable>

      {/* Fill tube + distributor, upper-left */}
      <Selectable id="distributor-tube" base={[-0.34, 0.48, -0.62]} explodeTo={[-0.34, 1.7, 0.6]} {...sel}>
        {(hl) => (
          <group>
            {/* vertical translucent fill tube */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.52, 20]} />
              <meshStandardMaterial
                color="#74c0ef"
                metalness={0}
                roughness={0.2}
                transparent
                opacity={0.8}
                emissive={hl ? ACCENT : '#000'}
                emissiveIntensity={hl ? 0.4 : 0}
              />
            </mesh>
            {/* short feed crossing to the evaporator */}
            <mesh position={[0.16, 0.32, 0]} rotation={[0, 0, Math.PI / 2.3]}>
              <cylinderGeometry args={[0.028, 0.028, 0.42, 16]} />
              <Mat preset="waterBlue" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* Water pan: open white tray on the back wall, left */}
      <Selectable id="water-pan" base={[-0.3, 0.05, -0.6]} explodeTo={[-0.3, 0.05, 1.1]} {...sel}>
        {(hl) => (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.54, 0.05, 0.44]} />
              <Mat preset="waterBlue" hl={hl} />
            </mesh>
            {[
              [0, 0.08, -0.21, 0.54, 0.16, 0.04],
              [0, 0.08, 0.21, 0.54, 0.16, 0.04],
              [-0.27, 0.08, 0, 0.04, 0.16, 0.44],
              [0.27, 0.08, 0, 0.04, 0.16, 0.44],
            ].map((b, i) => (
              <mesh key={i} position={[b[0], b[1], b[2]]}>
                <boxGeometry args={[b[3], b[4], b[5]]} />
                <Mat preset="waterBlue" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      {/* Storage bin: white floor + low walls at the bottom */}
      <Selectable id="storage-bin" base={[0, -1.12, 0.05]} explodeTo={[0, -1.12, 1.7]} {...sel}>
        {(hl) => (
          <group>
            <mesh position={[0, -0.28, 0]} receiveShadow>
              <boxGeometry args={[1.18, 0.06, 1.5]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
            {[
              [0, 0, -0.74, 1.18, 0.52, 0.06],
              [-0.59, 0, 0, 0.06, 0.52, 1.5],
              [0.59, 0, 0, 0.06, 0.52, 1.5],
              [0, 0, 0.74, 1.18, 0.52, 0.06],
            ].map((b, i) => (
              <mesh key={i} position={[b[0], b[1], b[2]]}>
                <boxGeometry args={[b[3], b[4], b[5]]} />
                <Mat preset="whitePlastic" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      {/* Bin temperature sensor on the right interior wall */}
      <Selectable id="bin-temp-sensor" base={[0.54, 0.22, -0.5]} explodeTo={[1.9, 0.22, -0.5]} {...sel}>
        {(hl) => (
          <group>
            <mesh>
              <boxGeometry args={[0.09, 0.09, 0.09]} />
              <Mat preset="control" hl={hl} />
            </mesh>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
              <Mat preset="blackPlastic" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      <Selectable id="water-filter" base={[0.46, 1.0, 0.78]} explodeTo={[0.46, 2.2, 1.5]} {...sel}>
        {(hl) => (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.46, 28]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.08, 28]} />
              <Mat preset="chrome" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      <Selectable id="control-board" base={[-0.42, 1.16, -1.05]} explodeTo={[-2.0, 1.4, -1.05]} {...sel}>
        {(hl) => (
          <group>
            <mesh>
              <boxGeometry args={[0.46, 0.32, 0.04]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.42, 0.28, 0.02]} />
              <meshStandardMaterial
                color="#1f9d57"
                metalness={0.2}
                roughness={0.6}
                emissive={hl ? ACCENT : '#000'}
                emissiveIntensity={hl ? 0.45 : 0}
              />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* ===== Rear water-system parts ===== */}
      <Selectable id="water-inlet-valve" base={[0.32, -1.45, -1.18]} explodeTo={[0.32, -1.45, -2.3]} {...sel}>
        {(hl) => (
          <group>
            <mesh>
              <boxGeometry args={[0.18, 0.16, 0.16]} />
              <Mat preset="stainlessDark" hl={hl} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.12, 20]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* Water pump module: white housing on the back wall (right) + black pump below */}
      <Selectable id="water-pump" base={[0.32, 0.08, -0.6]} explodeTo={[0.32, 0.08, 1.1]} {...sel}>
        {(hl) => (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.36, 0.44]} />
              <Mat preset="waterBlueDim" hl={hl} />
            </mesh>
            {/* threaded collar under the housing */}
            <mesh position={[-0.04, -0.22, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 20]} />
              <Mat preset="waterBlue" hl={hl} />
            </mesh>
            {/* black square pump body */}
            <mesh position={[-0.04, -0.35, 0.12]} castShadow>
              <boxGeometry args={[0.13, 0.18, 0.13]} />
              <Mat preset="blackPlastic" hl={hl} />
            </mesh>
            {/* outlet tube */}
            <mesh position={[-0.04, -0.5, 0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 12]} />
              <Mat preset="waterBlue" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* ===== Front door (hinged left) + pro bar handle + nameplate ===== */}
      <group ref={doorGroup} position={[-W / 2, -0.25, D / 2 + 0.02]}>
        <RoundedBox
          args={[W - 0.03, 2.78, 0.09]}
          radius={0.022}
          smoothness={5}
          position={[W / 2, 0, 0.045]}
          castShadow
        >
          {/* PrintShield satin stainless: brushed grain + directional sheen
              from anisotropy, under a soft clearcoat */}
          <meshPhysicalMaterial
            color="#c6cbcf"
            metalness={1}
            roughness={0.5}
            roughnessMap={brushedMetalMaps().roughnessMap}
            normalMap={brushedMetalMaps().normalMap}
            normalScale={BRUSHED_NORMAL_SCALE}
            anisotropy={0.55}
            anisotropyRotation={Math.PI / 2}
            clearcoat={0.55}
            clearcoatRoughness={0.4}
            envMapIntensity={0.9}
          />
        </RoundedBox>

        {/* Polished tubular pro handle near the top, on two standoffs */}
        <group position={[W / 2, 1.07, 0.14]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.042, 0.042, W - 0.3, 32]} />
            <Mat preset="chrome" hl={false} />
          </mesh>
          {[-(W / 2) + 0.18, W / 2 - 0.18].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              {/* fluted end cap */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.056, 0.056, 0.1, 32]} />
                <Mat preset="chrome" hl={false} />
              </mesh>
              {/* standoff post into the door */}
              <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.026, 0.026, 0.16, 20]} />
                <Mat preset="chrome" hl={false} />
              </mesh>
            </group>
          ))}
        </group>

        {/* KitchenAid nameplate near the bottom */}
        <group position={[W / 2, -0.78, 0.095]}>
          <mesh>
            <boxGeometry args={[0.42, 0.1, 0.012]} />
            <Mat preset="badge" hl={false} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <boxGeometry args={[0.34, 0.04, 0.006]} />
            <Mat preset="chrome" hl={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** Stainless trim framing the door opening on the front face. */
function FaceFrame() {
  const t = 0.07
  return (
    <group position={[0, 0, D / 2 - 0.02]}>
      <mesh position={[0, -H / 2 + 0.7, 0]}>
        <boxGeometry args={[W, t, 0.06]} />
        <Mat preset="stainless" hl={false} />
      </mesh>
      <mesh position={[-W / 2 + 0.035, 0, 0]}>
        <boxGeometry args={[t, H, 0.06]} />
        <Mat preset="stainless" hl={false} />
      </mesh>
      <mesh position={[W / 2 - 0.035, 0, 0]}>
        <boxGeometry args={[t, H, 0.06]} />
        <Mat preset="stainless" hl={false} />
      </mesh>
    </group>
  )
}

/** Fine cross-hatched chrome cutter grid — a HORIZONTAL plane of wires the ice
 *  slab is pushed through (matches photos 1–2). */
function CutterGrid({ hl }: { hl: boolean }) {
  const nx = 13 // wires running front-to-back, spaced across the width
  const nz = 9 // wires running left-to-right, spaced across the depth
  const w = 0.9
  const d = 0.58
  return (
    <group>
      {Array.from({ length: nx }).map((_, i) => (
        <mesh
          key={`x${i}`}
          position={[-w / 2 + (i * w) / (nx - 1), 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.004, 0.004, d, 6]} />
          <Mat preset="wire" hl={hl} />
        </mesh>
      ))}
      {Array.from({ length: nz }).map((_, i) => (
        <mesh
          key={`z${i}`}
          position={[0, 0, -d / 2 + (i * d) / (nz - 1)]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.004, 0.004, w, 6]} />
          <Mat preset="wire" hl={hl} />
        </mesh>
      ))}
    </group>
  )
}
