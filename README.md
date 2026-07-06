# anomalous-three.js-components

Importable React Three Fiber components. Includes **NightSkyCloudScene** — a futuristic, interactive night-sky scene with distant stars and glowing abstract 3D cloud icons floating at high altitude.

## Quick start (local demo)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Move your pointer for parallax; hover clouds to intensify their glow.

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
import { NightSkyCloudScene } from 'anomalous-three.js-components';

export default function Page() {
  return (
    <div style={{ height: '100vh' }}>
      <NightSkyCloudScene />
    </div>
  );
}
```

The parent container must have a defined height. The scene fills its parent (`width` and `height: 100%`).

## API — `NightSkyCloudScene`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | CSS class on the wrapper |
| `style` | `CSSProperties` | — | Inline styles on the wrapper |
| `cloudCount` | `number` | `8` | Number of floating cloud icons |
| `starCount` | `number` | `2000` | Stars in the distant field |
| `interactive` | `boolean` | `true` | Mouse/touch parallax and cloud hover glow |
| `autoRotate` | `boolean` | `false` | Subtle ambient camera drift |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local demo playground |
| `npm run build` | Library build to `dist/` |
| `npm run preview` | Preview production demo build |
