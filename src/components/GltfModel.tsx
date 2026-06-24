import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/** Renders a real GLB/GLTF model: auto-centered, auto-scaled to the scene
 *  height, with materials nudged toward brushed stainless so it catches the
 *  studio lighting + bloom. Drop a file at public/model/icemaker.glb. */
export default function GltfModel({ url, targetHeight = 3.4 }: { url: string; targetHeight?: number }) {
  const { scene } = useGLTF(url)

  const object = useMemo(() => {
    const root = scene.clone(true)

    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const enhance = (m: THREE.Material) => {
        const c = m.clone() as THREE.MeshStandardMaterial
        if ('metalness' in c) {
          c.metalness = Math.max((c.metalness as number) ?? 0, 0.82)
          c.roughness = 0.42
          c.envMapIntensity = 1.15
        }
        return c
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(enhance)
        : enhance(mesh.material)
    })

    // Center at the origin and scale so the unit is ~targetHeight tall.
    const box = new THREE.Box3().setFromObject(root)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    root.position.sub(center)
    const s = size.y > 0 ? targetHeight / size.y : 1

    const wrap = new THREE.Group()
    wrap.add(root)
    wrap.scale.setScalar(s)
    return wrap
  }, [scene, targetHeight])

  return <primitive object={object} />
}
