import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const LiquidLoading = () => {
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-32 h-32 opacity-50">
          <Image
            src="/reserva_logo_only_loading.gif"
            alt="Loading..."
            width={128}
            height={128}
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-32 h-32 animate-pulse">
          <Image
            src="/reserva_logo_only_loading.gif"
            alt="Loading..."
            width={128}
            height={128}
            unoptimized
            priority
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse" />
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Loading{dots}
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          Please wait while we fetch your data
        </p>
      </div>

      {/* Progress indicator */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export { LiquidLoading };
export default LiquidLoading;