import { useEffect } from 'react';

export default function Watermark() {
  useEffect(() => {
    console.log('LOGO_LOADED: Watermark rendered');
  }, []);

  return (
    <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none z-50">
      <img
        src="/logo.png"
        alt="NAMTLS Watermark"
        className="w-24 h-24 md:w-32 md:h-32 object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          console.warn('LOGO_LOADED: Watermark image failed to load, using text fallback');
        }}
      />
    </div>
  );
}
