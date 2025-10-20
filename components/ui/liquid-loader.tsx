'use client';

import React, { useState, useEffect } from 'react';

const LiquidLoading = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="w-12 h-12 relative">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.3) 0%, rgba(129, 140, 248, 0.3) 100%)'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* 2x2 Grid of animated boxes */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="w-16 h-16 relative">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl blur-xl"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #C084FC 50%, #818CF8 100%)',
                  animation: `glow${index} 1.6s ease-in-out infinite`,
                  opacity: 0
                }}
              />

              {/* Background frame */}
              <div
                className="absolute inset-0 rounded-2xl p-[2px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.3) 0%, rgba(129, 140, 248, 0.3) 100%)'
                }}
              >
                <div className="w-full h-full bg-white/50 backdrop-blur-sm rounded-xl" />
              </div>

              {/* Animated filled gradient */}
              <div
                className="absolute inset-0 rounded-2xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #C084FC 50%, #818CF8 100%)',
                  animation: `fillBox${index} 1.6s ease-in-out infinite`,
                  boxShadow: '0 8px 32px rgba(192, 132, 252, 0.4)'
                }}
              />

              {/* Inner shine effect */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  animation: `fillBox${index} 1.6s ease-in-out infinite`
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-center">
          <h2
            className="text-lg font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
            style={{
              animation: 'pulse-text 1.6s ease-in-out infinite'
            }}
          >
            Loading Dashboard
          </h2>
          <div className="flex justify-center items-center mt-2 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400"
                style={{
                  animation: `dot${i} 1.6s ease-in-out infinite`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fillBox0 {
          0% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          20% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          25% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          95%, 100% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
        }

        @keyframes fillBox1 {
          0%, 20% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          25% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          45% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          50%, 100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes fillBox2 {
          0%, 45% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          70% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes fillBox3 {
          0%, 70% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          75% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          95% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes glow0 {
          0% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          20% {
            opacity: 0.4;
            transform: scale(1.1);
          }
          25%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow1 {
          0%, 20% {
            opacity: 0;
            transform: scale(1);
          }
          25% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          45% {
            opacity: 0.4;
            transform: scale(1.1);
          }
          50%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow2 {
          0%, 45% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          70% {
            opacity: 0.4;
            transform: scale(1.1);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow3 {
          0%, 70% {
            opacity: 0;
            transform: scale(1);
          }
          75% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          95% {
            opacity: 0.4;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes pulse-text {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes dot0 {
          0%, 60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          20% {
            opacity: 1;
            transform: scale(1.2);
          }
          40% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes dot1 {
          0%, 60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes dot2 {
          0%, 50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
          60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export { LiquidLoading };
export default LiquidLoading;