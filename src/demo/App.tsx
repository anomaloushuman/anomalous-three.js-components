import { useEffect, useState } from 'react';
import { NightSkyCloudScene } from '../components/NightSkyCloudScene/NightSkyCloudScene';

export function App() {
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setHintVisible(true), 2200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <NightSkyCloudScene cloudCount={20} starCount={2500} interactive />
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
        Night Sky Cloud Scene — move pointer to parallax, hover clouds to glow
      </div>
    </div>
  );
}
