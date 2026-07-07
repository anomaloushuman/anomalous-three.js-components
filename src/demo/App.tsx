import { useEffect, useState } from 'react';
import { NightSkyCloudScene } from '../components/NightSkyCloudScene/NightSkyCloudScene';
import { NightSkyDataCenterScene } from '../components/NightSkyDataCenterScene/NightSkyDataCenterScene';

type DemoScene = 'cloud' | 'datacenter';

const SCENE_HINTS: Record<DemoScene, string> = {
  cloud: 'Night Sky Cloud Scene — move pointer to parallax, hover clouds to glow',
  datacenter: 'Night Sky Data Center — endless server rows flowing on the digital ocean',
};

export function App() {
  const [scene, setScene] = useState<DemoScene>('cloud');
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setHintVisible(false);
    const id = window.setTimeout(() => setHintVisible(true), 2200);
    return () => window.clearTimeout(id);
  }, [scene]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          color: 'rgba(232, 238, 255, 0.75)',
        }}
      >
        <label htmlFor="scene-select" style={{ letterSpacing: '0.04em' }}>
          Scene
        </label>
        <select
          id="scene-select"
          value={scene}
          onChange={(e) => setScene(e.target.value as DemoScene)}
          style={{
            background: 'rgba(8, 12, 24, 0.85)',
            color: 'rgba(232, 238, 255, 0.9)',
            border: '1px solid rgba(120, 140, 180, 0.35)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 13,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="cloud">Night Sky Cloud</option>
          <option value="datacenter">Night Sky Data Center</option>
        </select>
      </div>

      {scene === 'cloud' ? (
        <NightSkyCloudScene key="cloud" cloudCount={30} starCount={2500} interactive />
      ) : (
        <NightSkyDataCenterScene key="datacenter" starCount={2500} interactive />
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(232, 238, 255, 0.5)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: hintVisible ? 1 : 0,
          transition: 'opacity 1.4s ease-out',
        }}
      >
        {SCENE_HINTS[scene]}
      </div>
    </div>
  );
}
