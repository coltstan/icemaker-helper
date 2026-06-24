# Drop a real 3D model here

Put a GLB file at:

    public/model/icemaker.glb

The app HEAD-checks for it on load. If it's present, the viewer renders that
model automatically; if it's missing or fails to load, it falls back to the
built-in procedural model. No code change needed to swap models.

Tips:
- Tune the `scale={3.4}` prop on `<GltfModel>` in `src/components/Viewer3D.tsx`
  so the unit roughly fills the scene (about 3.5 world units tall).
- GLB (binary glTF) is preferred over .gltf+textures (single file, cached by the
  service worker for offline use).
- Good sources: Sketchfab (filter to "Downloadable" + a permissive license),
  CGTrader/TurboSquid (glTF/GLB export), or Poly Pizza (CC0).
- The clickable part hotspots are currently driven by the procedural model; once
  a real model is in place we map hotspots to its named nodes (or overlay
  invisible click targets) so selecting parts keeps working.
