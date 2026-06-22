# IceMaker Helper

A single-page app for the **KitchenAid KUIX505ESS2** 15" built-in automatic ice maker:

1. **Parts explorer** — an interactive 3D model with clickable parts that link to where to buy them.
2. **Problem solver** — a guided decision tree that steers you toward the cheapest correct fix
   (clean the condenser before buying anything).

Built with React + Vite + TypeScript, Tailwind CSS, and react-three-fiber / drei (Three.js).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

Mobile-friendly: the 3D viewer owns touch gestures (drag to rotate, pinch to zoom), and the part
detail panel becomes a bottom sheet on small screens.

## Project layout

```
src/
├── data/                 # ← all editable content lives here (no backend)
│   ├── types.ts          # shared types
│   ├── parts.ts          # parts catalogue + PartSelect links
│   └── troubleshooting.ts# the guided-solver decision tree
├── components/
│   ├── Viewer3D.tsx      # Canvas, OrbitControls, reset / door / exploded toggles
│   ├── IceMakerModel.tsx # the primitive 3D model (swap point for a real GLTF)
│   ├── PartsList.tsx     # legend / parts list
│   ├── PartPanel.tsx     # part detail panel / mobile bottom sheet
│   ├── Wizard.tsx        # problem-solver flow + progress trail
│   ├── CondenserGuide.tsx# the prominent "clean the condenser" guide
│   └── WarrantyCard.tsx  # always-available warranty & service helper
└── App.tsx               # tabs + layout
```

## Editing the data

**Parts** — edit `src/data/parts.ts`. Each entry is a `Part`:

- `region` must match a mesh-group id in `IceMakerModel.tsx` (that's the link between the list and
  the 3D model — clicking either selects the other).
- `partNumber` drives the PartSelect "View / buy" link (a search by part number, which resolves to
  the part page). Omit it and the button falls back to the model page. `modelSection` tells the user
  which PartSelect section to look under.
- `fitmentConfirmed: false` shows a warning badge (used for the condenser coil WP2313624).
- `infoOnly: true` marks a structural component that isn't sold separately (no price / buy button).

**Troubleshooting** — edit `src/data/troubleshooting.ts`. The tree is a flat map of steps:

- `question` steps have `options`, each pointing at the `next` step id.
- `conclusion` steps show a cause, a DIY/tech badge, an optional linked `partId`, and a next action.
  Set `guide: 'condenser'` to render the clean-the-condenser guide under the conclusion.
- `START_ID` is the entry point.

Both files are fully typed, so a bad id or missing field shows up at build time.

## Swapping in a real 3D model

The model is intentionally a clean, low-poly representation built from primitives (boxes, cylinders)
— there is no free CAD model of this exact unit, so it does **not** attempt photorealism. Each major
component is wrapped in a `<Selectable id="...">` group whose `id` matches a part `region`.

To drop in a real GLTF/GLB later:

1. Put `icemaker.glb` in `public/`.
2. In `IceMakerModel.tsx`, load it and replace the primitive meshes inside each `<Selectable>` with
   the corresponding GLTF node, keeping the same `id`s:

   ```tsx
   import { useGLTF } from '@react-three/drei'
   const { nodes } = useGLTF('/icemaker.glb')
   // ...
   <Selectable id="condenser" base={[0, 1.25, 0.25]} {...sel}>
     {() => <primitive object={nodes.Condenser} />}
   </Selectable>
   ```

3. Keep the `<Selectable>` wrappers so click-to-select and highlighting keep working, and keep the
   `region` ids in `data/parts.ts` in sync with the ids used here.

The highlight effect currently sets an emissive colour via the shared `<Mat>` helper (which reads
the `PRESETS` material table); for a GLTF you'd apply the highlight to the loaded material instead.
Lighting/reflections come from a self-contained studio rig (drei `Environment` + `Lightformer`s in
`Viewer3D.tsx`) — no external HDR download — and the canvas uses `frameloop="demand"` to stay
battery-friendly on phones.

## Note on accuracy

Prices and part numbers are as supplied for this model. The condenser coil (WP2313624) is flagged
because its fitment is **not** confirmed for the KUIX505ESS2. Every part view repeats: *confirm
fitment with your model number before ordering.* Sealed-system work (condenser, compressor,
refrigerant) is not DIY — the app says so wherever it comes up.
