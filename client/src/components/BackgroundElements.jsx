import React, { useEffect, useState } from 'react';

export default function BackgroundElements() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const update = () => {
      setCurrentPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.05,
        y: prev.y + (mousePos.y - prev.y) * 0.05
      }));
      requestAnimationFrame(update);
    };
    const anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [mousePos]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="orb w-[500px] h-[500px] bg-orange-600/30 -top-20 -left-20"
        style={{ transform: `translate(${currentPos.x * 0.1}px, ${currentPos.y * 0.1}px)` }}
      />
      <div 
        className="orb w-[400px] h-[400px] bg-red-600/20 -bottom-20 -right-20"
        style={{ transform: `translate(${-currentPos.x * 0.1}px, ${-currentPos.y * 0.1}px)` }}
      />
    </div>
  );
}