import React, { useEffect, useState } from 'react';

export const InteractiveBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="modern-auth-wrapper" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Dynamic Hover Glow */}
      <div 
        className="interactive-glow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.06), transparent 40%)`
        }}
      />

      {/* Static Orbs for depth */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>
      <div className="glow-orb glow-orb-3"></div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};
