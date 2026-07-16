import { useEffect } from 'react';

export default function Watermark() {
  useEffect(() => {
    console.log('NAMTLS E-Voting v2.0 loaded');
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <img
        src="/logo.png"
        alt="NAMATLS Watermark"
        onError={(e) => {
          e.target.style.display = 'none';
          console.warn('Watermark image failed to load');
        }}
      />
    </div>
  );
}