# Optional 3D models (GLTF / GLB)

This folder is intentionally **empty of binaries**. ARDA ROOM ships with a fully
procedural room so it stays light and fast on mobile — the one hard performance
constraint. Genuinely photoreal GLBs are typically **tens of MB each**, which
would break that.

To upgrade a specific "hero" object with an open-license model:

1. Download a **CC0** or **CC-BY** model and place its `.glb` here, e.g.
   `public/models/chair.glb`. Prefer game-ready assets with baked/compressed
   textures (ideally < ~1–2 MB). Good sources:
   - Poly Haven (CC0) — https://polyhaven.com/models
   - Quaternius (CC0) — https://quaternius.com
   - Kenney (CC0) — https://kenney.nl/assets
   - Khronos glTF Sample Assets (varied licenses — check each)
2. Wrap the procedural mesh you want to replace with `GltfProp` (see
   `src/components/furniture/GltfProp.tsx`):

   ```tsx
   <GltfProp url="/models/chair.glb" quality={quality}
             position={[0, 0, -3.8]} rotation={[0, Math.PI, 0]} scale={1}>
     <Chair />  {/* fallback: LOW tier or if the file is missing */}
   </GltfProp>
   ```

3. The model never loads on the LOW tier / mobile (procedural fallback keeps the
   fast path), and any load error falls back to the procedural mesh.
4. **Record the source URL and license below.**

## Bundled models & licenses

_(none yet)_

| File | Source | License | Author |
|------|--------|---------|--------|
|      |        |         |        |
