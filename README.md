# anomalous-three.js-components

Importable React Three Fiber scenes. Includes:

- **NightSkyCloudScene** — night sky with distant stars and glowing 3D cloud icons
- **NightSkyDataCenterScene** — floating server racks over a digital ocean
- **StaffingScene** — glass chess pieces ascending from a Tron-style digital grid

## Quick start (local demo)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use the **Scene** dropdown to switch between Cloud, Data Center, and Staffing.

## Build for import

```bash
npm run build
```

Outputs ESM + TypeScript declarations to `dist/`.

## Use in another repo

Install peer dependencies in your host app:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/postprocessing
```

Then link or reference this package:

**Option A — npm link**

```bash
# In this repo
npm link

# In your consumer repo
npm link anomalous-three.js-components
```

**Option B — file dependency** (in consumer `package.json`)

```json
"anomalous-three.js-components": "file:../anomalous-three.js-components"
```

**Usage**

```tsx
import {
  NightSkyCloudScene,
  NightSkyDataCenterScene,
  StaffingScene,
} from 'anomalous-three.js-components';

export default function Page() {
  return (
    <div style={{ height: '100vh' }}>
      {/* Pick one */}
      <NightSkyCloudScene />
      {/* <NightSkyDataCenterScene /> */}
      {/* <StaffingScene /> */}
    </div>
  );
}
```

The parent container must have a defined height. Each scene fills its parent (`width` and `height: 100%`).

---

## API — `NightSkyCloudScene`

Futuristic night-sky scene with parallax stars and floating cloud icons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |
| `cloudCount` | `number` | `8` | Number of floating cloud icons |
| `starCount` | `number` | `2000` | Stars in the distant field |
| `interactive` | `boolean` | `true` | Mouse/touch parallax and cloud hover glow |
| `autoRotate` | `boolean` | `false` | Subtle ambient camera drift |
| `introAnimation` | `boolean` | `true` | Animate camera and elements in on mount |

---

## API — `NightSkyDataCenterScene`

Endless server rows flowing over a shared digital-ocean / night-sky environment.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |
| `starCount` | `number` | `1200` | Stars in the distant field |
| `interactive` | `boolean` | `true` | Mouse/touch camera parallax |
| `autoRotate` | `boolean` | `false` | Subtle ambient camera drift |
| `introAnimation` | `boolean` | `true` | Animate camera and elements in on mount |

---

## API — `StaffingScene`

Glass chess pieces (pawn, rook, bishop, knight) that spawn centered on a glowing digital grid, then float upward continuously. Includes atmospheric particles, horizon fog, and grid-aligned placement.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |
| `peopleCount` | `number` | `14` | Number of simultaneously floating pieces |
| `maxActivePieces` | `number` | `14` | Alias for density tuning (overrides `peopleCount` when set) |
| `interactive` | `boolean` | `true` | Mouse/touch camera parallax |
| `autoRotate` | `boolean` | `false` | Subtle ambient camera drift |
| `introAnimation` | `boolean` | `true` | Animate camera and elements in on mount |

### Behavior notes

- Pieces spawn on the **centers of major 4×4 grid squares** (glowing line intersections)
- On load, pieces **materialize onto the grid** in a near→far wave, then ascend
- **Piece-type motion**: pawns rise faster; rooks slower / more majestic; random yaw on spawn
- Spawns avoid overlapping cells and camera sightline stacking
- Recycled pieces respawn on free grid cells with the same entrance transition
- GLB models live under `src/components/StaffingScene/models/` and are bundled with the library

```tsx
import { StaffingScene } from 'anomalous-three.js-components';

export default function StaffingHero() {
  return (
    <div style={{ height: '100vh' }}>
      <StaffingScene maxActivePieces={14} interactive />
    </div>
  );
}
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local demo playground |
| `npm run build` | Library build to `dist/` |
| `npm run preview` | Preview production demo build |
