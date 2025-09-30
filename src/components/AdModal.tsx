import { Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdModalProps {
  isVisible: boolean;
  message?: string;
}

export function AdModal({ isVisible, message = 'Loading your result...' }: AdModalProps) {
  const [showSkip, setShowSkip] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!isVisible) {
      setShowSkip(false);
      setTimeLeft(15);
      return;
    }

    // Show skip button after 7.5 seconds (halfway through 15 seconds)
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 7500);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(countdownInterval);
    };
  }, [isVisible]);

  const handleSkip = () => {
    if ((window as any).__skipPlaceholderAd) {
      (window as any).__skipPlaceholderAd();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="max-w-4xl w-full mx-4 text-center">
        {/* Ad Container */}
        <div className="bg-black rounded-2xl overflow-hidden mb-6 border border-white/10 relative">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
            {/* Placeholder video */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src="/placeholder.mp4"
            >
              Your browser does not support the video tag.
            </video>

            {/* Skip button - appears after 7.5 seconds */}
            {showSkip && (
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 font-medium text-sm border border-white/20"
              >
                <X className="w-4 h-4" />
                Skip Ad
              </button>
            )}

            {/* Timer display */}
            {!showSkip && (
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20">
                {timeLeft}s
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-3 text-white/70 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{message}</span>
        </div>

        {/* Info text */}
        <p className="text-white/40 text-xs">
          This helps keep Hairpiece free for everyone
        </p>
      </div>
    </div>
  );
}