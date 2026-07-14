import { useEffect } from 'react';

export default function Watermark() {
  useEffect(() => {
    console.log('LOGO_LOADED: Watermark rendered');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '8px',
      right: '8px',
      opacity: 0.15,
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      <img
        src="https://namtls-election-qatt.vercel.app/logo.png"
        alt="NAMATLS Watermark"
        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
        onError={(e) => {
          e.target.style.display = 'none';
          console.warn('LOGO_LOADED: Watermark image failed to load');
        }}
      />
    </div>
  );
}
