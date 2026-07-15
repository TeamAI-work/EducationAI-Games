# Optics Lab — Full Simulation Rewrite

## Goal
Replace the patchwork physics logic with a **ground-up, physically rigorous** simulation of:
1. **Ray Bench** — mirrors & lenses with three canonical principal rays
2. **Eye Clinic** — myopia / hypermetropia with accurate correction lens physics

---

## Physics Design

### Sign Convention (New Cartesian, unified)
Light always travels **left → right**. All distances measured from the **optical centre** (lens pole / mirror pole).

| Quantity | Sign rule |
|---|---|
| `u` (object distance) | Always **negative** (object is on the left) |
| `v` (image distance) | + = transmitted side (real for lens), − = reflected/same side |
| `f` for **convex lens** | **+** (converging) |
| `f` for **concave lens** | **−** (diverging) |
| `f` for **concave mirror** | **−** (focal point is in front = negative) |
| `f` for **convex mirror** | **+** (focal point is behind = positive) |

### Formulas
- **Lens**: `1/v − 1/u = 1/f`  →  `1/v = 1/f + 1/u`
- **Mirror**: `1/v + 1/u = 1/f`  →  `1/v = 1/f − 1/u`
- **Magnification**: `m = v/u` (both already signed; negative m = inverted)
- **Real image**:
  - Lens: `v > 0`
  - Mirror: `v < 0` (in front of mirror)

### Image position on canvas
- Object is always to the **LEFT** of the optical element at `objX = lensX − |u|`
- Image is at `imgX = lensX + v` (v is signed, so this naturally places it correctly)
- For mirrors: real image at `imgX < lensX`, virtual at `imgX > lensX`
- For lenses: real image at `imgX > lensX`, virtual at `imgX < lensX`

### Principal Rays — LENS
All three rays come from the **tip of the object arrow**.

| Ray | Before lens | After lens |
|---|---|---|
| R1 (parallel) | Horizontal from object tip to lens | Passes through **far focal point F₂** (at `lensX + f`) |
| R2 (centre) | Straight line through optical centre (`lensX, midY`) | Continues in the same direction (no deviation) |
| R3 (focal) | Aimed at **near focal point F₁** (at `lensX − f`), hits lens | Exits **parallel** to the principal axis |

For **virtual images** (diverging lens or object inside F):
- The real rays diverge after the lens
- Dashed backtraces toward the virtual image position on the same side as the object

### Principal Rays — MIRROR
All rays travel left→right until they hit the mirror, then reflect back left.

| Ray | Incoming | After reflection |
|---|---|---|
| R1 (parallel) | Horizontal to mirror pole | Reflects through focal point **F** (at `lensX − |f|`) |
| R2 (focal) | Aimed at focal point F | Reflects **parallel** to axis |
| R3 (centre) | Aimed at centre of curvature C (at `lensX − 2|f|`) | Reflects back on itself (through C) |

For **convex mirror** (always virtual, erect, diminished):
- All reflected rays diverge; dashed backtraces show virtual image behind mirror

### Eye Clinic Physics
The eye is modelled with a fixed cornea+lens system. The **uncorrected** focal distances:

| Defect | Uncorrected focal point |
|---|---|
| Myopia (short-sighted) | In **front** of retina (too close) |
| Hypermetropia (long-sighted) | **Behind** retina (too far) |

**Correction lenses** modify where the rays converge inside the eye:
- **Myopia** → concave (−) lens diverges incoming rays → eye's optical system now focuses them further back, onto the retina
- **Hypermetropia** → convex (+) lens converges incoming rays → eye focuses them onto the retina (not behind it)

The correction power in diopters `D` shifts the virtual focal plane:
- `correctedFocalX = uncorrectedFocalX + D × shiftFactor` for concave (myopia)
- `correctedFocalX = uncorrectedFocalX − D × shiftFactor` for convex (hypermetropia)
- Using wrong lens type moves focal point in the wrong direction (worsens defect)

Vision is "corrected" when `|convergeX − retinaX| < threshold`.

---

## Files to Rewrite

### 1. `opticsConstants.js` — **Keep as-is** (only minor additions)
- No changes needed.

---

### 2. `useOpticsLab.js` — **Full rewrite**
The hook manages state, the RAF loop, telemetry, and drag interaction.

Key improvements:
- `calcImage()` uses the correct unified formula with proper sign convention for all 4 types
- `imgX = lensX + vPx` (vPx already signed correctly)
- `imgH = objH * |m| * sign(m)` — negative m = inverted
- Object drag clamped to stay outside focal length (but allowed anywhere left of lens for diverging types)
- Telemetry shows signed `v` and correct nature string
- Eye mode telemetry shows correction status

---

### 3. `opticsDrawing.js` — **Full rewrite**

#### `drawRays()` — Complete rewrite with correct geometry
Each ray is computed geometrically from first principles using **line-line intersection** instead of hardcoded slopes.

For LENS:
- R1: enters horizontal, exits through (lensX, objTipY) → (farF, midY) direction
- R2: straight line through (lensX, midY)  
- R3: enters through (objX, objTipY) aimed at nearF, exits horizontal at atLensY

For MIRROR (all rays go L→R then reflect L):
- R1: enters horizontal, hits pole at (lensX, objTipY), reflects through (focalPt, midY) direction
- R2: enters aimed at focalPt, hits pole, reflects horizontal
- R3: enters aimed at centrePt, hits pole, reflects back through centrePt

Virtual image cases draw solid real rays + dashed backtraces.

#### `drawEye()` — Improved anatomy labels
- Add labels: Cornea, Lens, Retina
- Vitreous humour shading

#### `drawEyeRays()` — Improved physics model
- More realistic ray bending at the correction lens position
- Show the correction lens bending effect visually (rays converge/diverge at the spectacle lens)
- Two-stage ray path: (1) correction lens → (2) eye lens → focal point
- Correct lens type reduces defect; wrong type increases it

---

## Verification Plan
After implementation, manually verify these cases:

| Scenario | Expected result |
|---|---|
| Convex lens, u=2f | v=2f, m=−1, real, inverted, same size |
| Convex lens, u=f | v=∞, no image |
| Convex lens, u<f | Virtual, erect, magnified |
| Concave lens, any u | Always virtual, erect, diminished |
| Concave mirror, u>2f | Real, inverted, diminished (v between f and 2f) |
| Concave mirror, u=2f | v=2f, m=−1, real, inverted |
| Concave mirror, u=f | v=∞ |
| Concave mirror, u<f | Virtual, erect, magnified |
| Convex mirror, any u | Always virtual, erect, diminished |
| Myopia + concave lens correct D | Vision corrected |
| Hypermetropia + convex lens correct D | Vision corrected |
| Wrong lens type | Defect worsens |
