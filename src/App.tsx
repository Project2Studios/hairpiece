import { useState } from 'react';
import { Upload, Sparkles, Loader2, ImageIcon, X, ZoomIn } from 'lucide-react';
import { generateHairstyleImage } from './gemini';
import { adService } from './services/adService';
import { AdModal } from './components/AdModal';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [hairstyle, setHairstyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showingAd, setShowingAd] = useState(false);
  const [resultImage, setResultImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage('');
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !hairstyle.trim()) {
      setError('Please upload a photo and describe a hairstyle');
      return;
    }

    setLoading(true);
    setShowingAd(true);
    setError('');

    try {
      // Show ad during loading (non-blocking)
      await adService.showLoadingAd({
        onStart: () => {
          console.log('Ad started');
        },
        onComplete: () => {
          console.log('Ad completed');
          setShowingAd(false);
        },
        onDismissed: () => {
          console.log('Ad dismissed');
          setShowingAd(false);
        },
      });

      // Generate the hairstyle image
      const result = await generateHairstyleImage(selectedImage, hairstyle);
      setResultImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
      setShowingAd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Hairpiece
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Transform your look with AI-powered hairstyle visualization
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Column - Upload and Input */}
            <div className="p-8 md:p-10 space-y-6">
              {/* Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Your Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  <label
                    htmlFor="image-upload"
                    className="group relative block w-full h-full cursor-pointer transition-all hover:shadow-lg"
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium text-gray-700">
                            Change photo
                          </div>
                        </div>
                      </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 group-hover:border-purple-400 group-hover:bg-purple-50/50 transition-all">
                      <div className="p-4 rounded-full bg-purple-100 mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}
                  </label>
                  {previewUrl && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFullscreenImage(previewUrl);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all z-10"
                      title="View fullscreen"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>
              </div>

              {/* Hairstyle Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Describe Your Hairstyle
                </label>
                <input
                  type="text"
                  value={hairstyle}
                  onChange={(e) => setHairstyle(e.target.value)}
                  placeholder="e.g., long blonde waves, short pixie cut, curly bob..."
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 text-gray-800"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedImage || !hairstyle.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:hover:shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Hairstyle
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Result */}
            <div className="p-8 md:p-10 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-l border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your New Look
              </label>

              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-inner border-2 border-gray-100">
                {resultImage ? (
                  <>
                    <img
                      src={resultImage}
                      alt="Generated hairstyle"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFullscreenImage(resultImage)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all"
                      title="View fullscreen"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="p-6 rounded-full bg-gray-100 mb-4">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <p className="text-center px-8 text-sm">
                      Your AI-generated hairstyle will appear here
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Google Gemini AI
            </span>
          </p>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            title="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Ad Modal */}
      <AdModal
        isVisible={showingAd}
        message="Generating your new hairstyle..."
      />
    </div>
  );
}

export default App;