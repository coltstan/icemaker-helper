import { useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCursor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

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

// 15"W × 25"D × 34"H, scaled ÷10.
const W = 1.5
const H = 3.4
const D = 2.5
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
  wire: { color: '#dde2e6', metalness: 1, roughness: 0.22, envMapIntensity: 1.3 },
  whitePlastic: { color: '#eef1f3', metalness: 0, roughness: 0.5 },
  whitePlasticDim: { color: '#dbe0e4', metalness: 0, roughness: 0.62 },
  blackPlastic: { color: '#202327', metalness: 0.25, roughness: 0.45 },
  darkMetal: { color: '#3a3f45', metalness: 0.85, roughness: 0.4 },
  copper: { color: '#b06b3a', metalness: 1, roughness: 0.36, envMapIntensity: 1.1 },
  badge: { color: '#15181c', metalness: 0.5, roughness: 0.35 },
} as const

type Preset = keyof typeof PRESETS

function Mat({ preset, hl }: { preset: Preset; hl: boolean }) {
  return (
    <meshStandardMaterial
      {...PRESETS[preset]}
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
      {/* ===== Cabinet shell (open front; thin stainless panels) ===== */}
      <group>
        {/* back, sides, top, bottom */}
        <mesh position={[0, 0, -D / 2]} castShadow receiveShadow>
          <boxGeometry args={[W, H, WALL]} />
          <Mat preset="stainlessDark" hl={false} />
        </mesh>
        <mesh position={[-W / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[WALL, H, D]} />
          <Mat preset="stainless" hl={false} />
        </mesh>
        <mesh position={[W / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[WALL, H, D]} />
          <Mat preset="stainless" hl={false} />
        </mesh>
        <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, WALL, D]} />
          <Mat preset="stainless" hl={false} />
        </mesh>
        <mesh position={[0, -H / 2, 0]} receiveShadow>
          <boxGeometry args={[W, WALL, D]} />
          <Mat preset="stainlessDark" hl={false} />
        </mesh>

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
      <group position={[0, H / 2 - 0.28, D / 2 - 0.03]}>
        {/* surrounding stainless housing */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[W - 0.05, 0.52, 0.05]} />
          <Mat preset="stainlessDark" hl={false} />
        </mesh>
        {/* dark recess behind the louvers */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[W - 0.16, 0.44, 0.02]} />
          <meshStandardMaterial color="#141719" metalness={0.3} roughness={0.85} />
        </mesh>
        {/* angled satin louvers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, 0.18 - i * 0.06, 0.01]} rotation={[-0.5, 0, 0]} castShadow>
            <boxGeometry args={[W - 0.15, 0.05, 0.018]} />
            <Mat preset="stainless" hl={false} />
          </mesh>
        ))}
      </group>

      {/* ===== Sealed-system components behind the grille ===== */}
      <Selectable id="condenser" base={[0, 1.28, 0.18]} explodeTo={[0, 2.75, 0.18]} {...sel}>
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

      <Selectable id="condenser-fan" base={[-0.36, 1.2, -0.55]} explodeTo={[-2.0, 1.2, -0.55]} {...sel}>
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

      <Selectable id="compressor" base={[0.42, 0.95, -0.62]} explodeTo={[2.1, 0.6, -0.62]} {...sel}>
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

      {/* ===== Interior: evaporator, cutter grid, distribution tray ===== */}
      <Selectable id="evaporator-plate" base={[0, 0.42, -0.86]} explodeTo={[0, 0.42, -2.1]} {...sel}>
        {(hl) => (
          <group>
            <mesh castShadow>
              <boxGeometry args={[1.04, 0.56, 0.07]} />
              <Mat preset="stainless" hl={hl} />
            </mesh>
            {/* serpentine tubing */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[0, -0.22 + i * 0.088, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.018, 0.018, 0.98, 16]} />
                <Mat preset="copper" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      <Selectable id="cutter-grid" base={[0, 0.34, -0.42]} explodeTo={[0, 0.34, 1.2]} {...sel}>
        {(hl) => <CutterGrid hl={hl} />}
      </Selectable>

      <Selectable id="distributor-tube" base={[0, 0.78, -0.5]} explodeTo={[0, 2.0, 0.5]} {...sel}>
        {(hl) => (
          <group>
            {/* white distribution tray */}
            <mesh>
              <boxGeometry args={[1.0, 0.07, 0.34]} />
              <Mat preset="whitePlasticDim" hl={hl} />
            </mesh>
            {/* feed tube */}
            <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.9, 16]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      {/* ===== Water pan + black square drain cap (photo 3) ===== */}
      <Selectable id="water-pan" base={[0, -0.55, -0.05]} explodeTo={[0, -0.55, 1.35]} {...sel}>
        {(hl) => (
          <group>
            <mesh receiveShadow>
              <boxGeometry args={[1.0, 0.12, 1.1]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
            {/* recessed pan well */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.7, 0.1, 0.7]} />
              <Mat preset="whitePlasticDim" hl={hl} />
            </mesh>
            {/* black square drain cap */}
            <mesh position={[0, -0.12, 0.0]} castShadow>
              <boxGeometry args={[0.14, 0.16, 0.14]} />
              <Mat preset="blackPlastic" hl={hl} />
            </mesh>
          </group>
        )}
      </Selectable>

      <Selectable id="storage-bin" base={[0, -1.05, 0.18]} explodeTo={[0, -1.05, 1.7]} {...sel}>
        {(hl) => (
          <group>
            <mesh position={[0, -0.3, 0]} receiveShadow>
              <boxGeometry args={[1.16, 0.06, 1.4]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
            {[
              [0, 0, -0.7, 1.16, 0.6, 0.06],
              [-0.58, 0, 0, 0.06, 0.6, 1.4],
              [0.58, 0, 0, 0.06, 0.6, 1.4],
              [0, 0, 0.7, 1.16, 0.6, 0.06],
            ].map((b, i) => (
              <mesh key={i} position={[b[0], b[1], b[2]]}>
                <boxGeometry args={[b[3], b[4], b[5]]} />
                <Mat preset="whitePlastic" hl={hl} />
              </mesh>
            ))}
          </group>
        )}
      </Selectable>

      <Selectable id="bin-temp-sensor" base={[0.46, -0.62, -0.82]} explodeTo={[1.7, -0.62, -0.82]} {...sel}>
        {(hl) => (
          <group>
            <mesh>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <Mat preset="whitePlastic" hl={hl} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
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

      <Selectable id="control-board" base={[-0.4, 0.78, -1.08]} explodeTo={[-1.9, 1.5, -1.08]} {...sel}>
        {(hl) => (
          <group>
            <mesh>
              <boxGeometry args={[0.46, 0.32, 0.04]} />
              <Mat preset="darkMetal" hl={hl} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.42, 0.28, 0.02]} />
              <meshStandardMaterial
                color="#1f5132"
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

      <Selectable id="water-pump" base={[-0.3, -1.5, -1.12]} explodeTo={[-0.3, -1.5, -2.3]} {...sel}>
        {(hl) => (
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.22, 28]} />
            <Mat preset="darkMetal" hl={hl} />
          </mesh>
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
          {/* PrintShield satin stainless with a soft clearcoat sheen */}
          <meshPhysicalMaterial
            color="#c6cbcf"
            metalness={1}
            roughness={0.5}
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

/** Fine cross-hatched chrome cutter grid (matches photos 1–2). */
function CutterGrid({ hl }: { hl: boolean }) {
  const verticals = 15
  const horizontals = 9
  const w = 1.0
  const h = 0.9
  return (
    <group>
      {Array.from({ length: verticals }).map((_, i) => (
        <mesh key={`v${i}`} position={[-w / 2 + (i * w) / (verticals - 1), 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, h, 8]} />
          <Mat preset="wire" hl={hl} />
        </mesh>
      ))}
      {Array.from({ length: horizontals }).map((_, i) => (
        <mesh
          key={`h${i}`}
          position={[0, -h / 2 + (i * h) / (horizontals - 1), 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.005, 0.005, w, 8]} />
          <Mat preset="wire" hl={hl} />
        </mesh>
      ))}
    </group>
  )
}
