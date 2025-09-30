import { Loader2, Film } from 'lucide-react';

interface AdModalProps {
  isVisible: boolean;
  message?: string;
}

export function AdModal({ isVisible, message = 'Loading your result...' }: AdModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4 text-center">
        {/* Ad Container - Google will inject video ad here */}
        <div className="bg-white/10 rounded-2xl p-8 mb-6 border border-white/20">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {/* Placeholder for ad - Google Ad Placement API will take over */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 animate-pulse">
                <Film className="w-10 h-10 text-white" />
              </div>
            </div>

            <p className="text-white text-lg font-medium mb-2">
              Please wait...
            </p>
            <p className="text-white/70 text-sm">
              {message}
            </p>

            {/* Loading indicator */}
            <div className="mt-8 flex items-center gap-2 text-white/50">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Processing your request</span>
            </div>
          </div>
        </div>

        {/* Info text */}
        <p className="text-white/40 text-xs">
          This helps keep Hairpiece free for everyone
        </p>
      </div>
    </div>
  );
}