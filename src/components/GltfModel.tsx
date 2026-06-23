import { useGLTF, Center } from '@react-three/drei'

/** Renders a real GLB/GLTF model, auto-centered. Drop a file at
 *  public/model/icemaker.glb and it loads automatically (see Viewer3D).
 *  Tune `scale` to fit the unit to the scene's ~3.5-unit height. */
export default function GltfModel({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url)
  // Cast shadows from every mesh in the loaded model.
  scene.traverse((o) => {
    // @ts-expect-error - isMesh is a runtime flag on three objects
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return (
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  )
}
