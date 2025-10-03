import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const LiquidLoading = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 opacity-50 overflow-hidden rounded-3xl">
          <Image
            src="/reserva_logo_only_loading.gif"
            alt="Loading..."
            width={80}
            height={80}
            unoptimized
            className="scale-125 -ml-2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* Modern Animated Logo with GIF */}
      <div className="relative">
        {/* Logo with soft glow - cropped to remove border */}
        <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl flex items-center justify-center">
          <div className="relative w-20 h-20 overflow-hidden rounded-2xl">
            <Image
              src="/reserva_logo_only_loading.gif"
              alt="Loading..."
              width={100}
              height={100}
              unoptimized
              priority
              className="absolute top-0 left-0 scale-125 -ml-2 -mt-1"
            />
          </div>
        </div>

        {/* Animated gradient ring */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#FFD6FF] via-[#E7C6FF] to-[#C8B6FF] animate-spin-slow opacity-40 blur-xl" />
        </div>
      </div>

      {/* Loading Text with gradient */}
      <div className="flex flex-col items-center space-y-3">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[#C8B6FF] to-[#B8A6EF] bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Loading Dashboard
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          Please wait a moment
        </p>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-72 h-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-[#C8B6FF] to-[#B8A6EF] animate-[loading_1.5s_ease-in-out_infinite] shadow-lg" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
            width: 40%;
          }
          50% {
            width: 60%;
          }
          100% {
            transform: translateX(250%);
            width: 40%;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg) scale(1.1);
          }
          to {
            transform: rotate(360deg) scale(1.1);
          }
        }
        @keyframes pulse1 {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
        @keyframes pulse2 {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
        @keyframes pulse3 {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
        @keyframes pulse4 {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export { LiquidLoading };
export default LiquidLoading;