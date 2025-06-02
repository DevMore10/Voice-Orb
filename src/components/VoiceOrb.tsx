import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import VoicePanel from "./VoicePanel";

export default function VoiceOrbInterface() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const orbRef = useRef(null);
  const dragThreshold = 5;

  // Initialize orb position
  useEffect(() => {
    const updatePosition = () => {
      const defaultX = window.innerWidth - 80;
      const defaultY = window.innerHeight - 80;
      setOrbPosition({ x: defaultX, y: defaultY });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  // Handle panel open/close body scroll
  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPanelOpen]);

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    setDragStart({
      x: e.clientX - orbPosition.x,
      y: e.clientY - orbPosition.y,
      startX: e.clientX,
      startY: e.clientY,
    });
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (dragStart.x === 0 && dragStart.y === 0) return;

    const deltaX = Math.abs(e.clientX - dragStart.startX);
    const deltaY = Math.abs(e.clientY - dragStart.startY);

    if ((deltaX > dragThreshold || deltaY > dragThreshold) && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging || deltaX > dragThreshold || deltaY > dragThreshold) {
      const newX = Math.max(0, Math.min(window.innerWidth - 64, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 64, e.clientY - dragStart.y));
      setOrbPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      setIsPanelOpen(true);
    }
    setDragStart({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleTouchStart = (e: any) => {
    const touch = e.touches[0];
    const rect = orbRef.current.getBoundingClientRect();
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (dragStart.x === 0 && dragStart.y === 0) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - (orbPosition.x + dragStart.x));
    const deltaY = Math.abs(touch.clientY - (orbPosition.y + dragStart.y));

    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      setIsDragging(true);
      const newX = Math.max(0, Math.min(window.innerWidth - 64, touch.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 64, touch.clientY - dragStart.y));
      setOrbPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) {
      setIsPanelOpen(true);
    }
    setDragStart({ x: 0, y: 0 });
    setIsDragging(false);
  };

  useEffect(() => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [dragStart, orbPosition, isDragging]);

  const NeuralNetworkIcon = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none">
      <circle
        cx="8"
        cy="8"
        r="2"
        fill="white"
        opacity="0.9"
      />
      <circle
        cx="20"
        cy="8"
        r="2"
        fill="white"
        opacity="0.9"
      />
      <circle
        cx="14"
        cy="14"
        r="2.5"
        fill="white"
      />
      <circle
        cx="8"
        cy="20"
        r="2"
        fill="white"
        opacity="0.9"
      />
      <circle
        cx="20"
        cy="20"
        r="2"
        fill="white"
        opacity="0.9"
      />
      <line
        x1="10"
        y1="8"
        x2="12"
        y2="14"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        x1="18"
        y1="8"
        x2="16"
        y2="14"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        x1="12"
        y1="16"
        x2="10"
        y2="20"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        x1="16"
        y1="16"
        x2="18"
        y2="20"
        stroke="white"
        strokeWidth="1"
        opacity="0.7"
      />
    </svg>
  );

  const VoiceVisualization = () => (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Concentric circles */}
      <div className="absolute inset-0 rounded-full border border-blue-200/40"></div>
      <div className="absolute inset-3 rounded-full border border-blue-300/50"></div>
      <div className="absolute inset-6 rounded-full border border-blue-400/60"></div>
      <div className="absolute inset-9 rounded-full border border-blue-500/70"></div>

      {/* Center blue glow */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-30 blur-sm"></div>
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 opacity-40"></div>

      {/* Floating dots */}
      <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-6 left-12 animate-pulse"></div>
      <div className="absolute w-1 h-1 bg-blue-300 rounded-full top-12 right-10 animate-pulse delay-300"></div>
      <div className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full bottom-10 left-16 animate-pulse delay-700"></div>
      <div className="absolute w-1 h-1 bg-blue-400 rounded-full bottom-12 right-12 animate-pulse delay-500"></div>
      <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full top-16 left-6 animate-pulse delay-1000"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Floating Voice Orb */}
      <div
        ref={orbRef}
        className={`fixed w-16 h-16 rounded-full cursor-pointer select-none transition-all duration-300 z-50 ${
          isPanelOpen ? "scale-0" : "scale-100 hover:scale-105"
        } ${isDragging ? "" : "transition-transform"}`}
        style={{
          left: `${orbPosition.x}px`,
          top: `${orbPosition.y}px`,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 0 20px rgba(102, 126, 234, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)",
          animation: isPanelOpen ? "none" : "pulse 3s infinite",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}>
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <NeuralNetworkIcon />
        </div>
      </div>

      {/* Panel Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsPanelOpen(false)}>
          {/* Glassmorphism Panel */}
          <div
            className="fixed z-40 flex flex-col rounded-2xl shadow-xl transition-all duration-500 ease-in-out bg-white/90 backdrop-blur-md border border-slate-200 overflow-hidden w-[90vw] h-[85vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100"
            onClick={(e) => e.stopPropagation()}>
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-medium text-slate-700">Kiaan</h2>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100/50 hover:bg-slate-200/50 flex items-center justify-center transition-colors">
                <X
                  size={16}
                  className="text-slate-600"
                />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side - Voice Visualization */}
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <VoiceVisualization />
              </div>

              {/* Right Side - Controls */}
              <VoicePanel />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          50% {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }

        @media (max-width: 768px) {
          .w-80 {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
