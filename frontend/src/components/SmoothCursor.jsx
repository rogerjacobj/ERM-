import { useEffect, useRef, useState } from 'react';

const SmoothCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onEnterInteractive = () => setIsHovering(true);
    const onLeaveInteractive = () => setIsHovering(false);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) ${isHovering ? 'scale(1.6)' : 'scale(1)'} ${isClicking ? 'scale(0.8)' : ''}`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Track interactive elements
    const interactiveSelector = 'a, button, input, textarea, select, [role="button"], label, summary';
    const addListeners = () => {
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovering, isClicking]);

  // Hide on touch-only devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Inner dot — solid black square with neo feel */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '10px',
          height: '10px',
          background: '#1A1A1A',
          border: '2px solid #1A1A1A',
          borderRadius: '2px',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'width 0.15s, height 0.15s, border-radius 0.15s',
          ...(isHovering ? { width: '6px', height: '6px', borderRadius: '50%' } : {}),
          ...(isClicking ? { width: '6px', height: '6px' } : {}),
        }}
      />
      {/* Outer ring — thick bordered ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          border: '3px solid #1A1A1A',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'transform 0.15s ease, border-color 0.15s, background 0.15s',
          background: isHovering ? 'rgba(255, 230, 0, 0.3)' : 'transparent',
          borderColor: isHovering ? '#4F46E5' : '#1A1A1A',
        }}
      />
    </>
  );
};

export default SmoothCursor;
