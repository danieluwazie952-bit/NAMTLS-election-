import { useEffect } from 'react';

export default function Watermark() {
  useEffect(() => {
    console.log('LOGO_LOADED: Watermark rendered');
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <img
        src="/logo.png"
        alt="NAMATLS Watermark"
        onError={(e) => {
          e.target.style.display = 'none';
          console.warn('LOGO_LOADED: Watermark image failed to load');
        }}
      />
    </div>
  );
}