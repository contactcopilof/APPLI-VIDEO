import React, { useState, useEffect } from 'react';
import { Video, Loader2, Sparkles, AlertCircle, Play, CheckCircle2 } from 'lucide-react';
import { AssetUploader } from './components/AssetUploader';
import { UploadedAsset, GenerationStatus } from './types';
import { generateCopilofVideo, checkApiKey, promptApiKey } from './services/geminiService';

// Default prompt optimized for the context
const DEFAULT_PROMPT = "A professional cinematic presentation video featuring this business leader and the company logo. The video should have a corporate, trustworthy atmosphere with bright lighting. The leader is presenting in a modern office environment. The CopilOF logo appears elegantly as a watermark or intro graphic. The theme is 'Partner in training compliance'. High resolution, photorealistic.";

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [leaderAsset, setLeaderAsset] = useState<UploadedAsset | null>(null);
  const [logoAsset, setLogoAsset] = useState<UploadedAsset | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  const handleConnect = async () => {
    try {
      await promptApiKey();
      // Assume success after prompt returns (handling race condition)
      setHasKey(true); 
    } catch (e) {
      console.error(e);
      setError("Failed to select API key");
    }
  };

  const handleGenerate = async () => {
    if (!leaderAsset || !logoAsset) return;
    
    setStatus(GenerationStatus.PREPARING);
    setError(null);
    setVideoUrl(null);

    try {
      setStatus(GenerationStatus.GENERATING);
      const url = await generateCopilofVideo(leaderAsset, logoAsset, prompt);
      setVideoUrl(url);
      setStatus(GenerationStatus.COMPLETED);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during video generation.");
      setStatus(GenerationStatus.ERROR);
      
      // If unauthorized, reset key state
      if (e.message?.includes("403") || e.message?.includes("not found")) {
        setHasKey(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-copilof-dark text-white p-1.5 rounded-lg">
              <Video className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-copilof-dark">CopilOF <span className="text-copilof-teal font-light">Studio</span></span>
          </div>
          
          {!hasKey ? (
             <button 
              onClick={handleConnect}
              className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Connect API Key
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              API Connected
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Create Your Corporate Presentation</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload the leader's photo and the CopilOF logo. We'll use Gemini Veo to generate a professional video presentation instantly.
          </p>
        </div>

        {!hasKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Google Cloud Billing Required</h3>
            <p className="text-amber-800 mb-6">
              To use the high-quality Veo video generation model, you need a paid API key from Google AI Studio.
            </p>
            <button 
              onClick={handleConnect}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-amber-600/20"
            >
              Select Paid API Key
            </button>
            <div className="mt-4">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-amber-700 underline text-sm">
                Learn more about billing
              </a>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 ${!hasKey ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Inputs Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Upload Assets
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <AssetUploader 
                  label="Leader Photo" 
                  asset={leaderAsset} 
                  onAssetChange={setLeaderAsset} 
                />
                <AssetUploader 
                  label="Company Logo" 
                  asset={logoAsset} 
                  onAssetChange={setLogoAsset} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Video Concept
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-copilof-teal focus:border-transparent resize-none text-slate-700"
                placeholder="Describe how the video should look..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!leaderAsset || !logoAsset || status === GenerationStatus.GENERATING || status === GenerationStatus.POLLING}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                !leaderAsset || !logoAsset 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : status === GenerationStatus.GENERATING || status === GenerationStatus.POLLING
                    ? 'bg-copilof-dark/80 text-white cursor-wait'
                    : 'bg-gradient-to-r from-copilof-dark to-copilof-teal text-white hover:shadow-xl hover:shadow-copilof-teal/20 transform hover:-translate-y-0.5'
              }`}
            >
              {status === GenerationStatus.GENERATING || status === GenerationStatus.POLLING ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Video (This takes ~1-2 mins)...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Video
                </>
              )}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="flex flex-col h-full">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Result
                </h2>
                
                <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center min-h-[300px]">
                  {videoUrl ? (
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : status === GenerationStatus.GENERATING || status === GenerationStatus.POLLING ? (
                     <div className="text-center px-6">
                        <div className="w-16 h-16 border-4 border-copilof-teal border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-white font-medium text-lg mb-2">Generating with Gemini Veo...</h3>
                        <p className="text-slate-400 text-sm">We are synthesizing the video frames. Please do not close this tab.</p>
                     </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 ml-1 text-slate-600" />
                      </div>
                      <p>Your video will appear here</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
