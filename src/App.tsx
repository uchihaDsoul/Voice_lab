import { useState } from "react";
import { TopNav } from "./components/layout/TopNav";
import { Sidebar } from "./components/layout/Sidebar";
import { UploadZone } from "./components/dashboard/UploadZone";
import { ForensicMetrics } from "./components/dashboard/ForensicMetrics";
import { DangerDetection } from "./components/dashboard/DangerDetection";
import { AudioVisualizer } from "./components/dashboard/AudioVisualizer";
import { SettingsModal } from "./components/dashboard/SettingsModal";
import { AnalysisHistory } from "./components/dashboard/AnalysisHistory";
import { analyzeAudio, AnalysisResult } from "./lib/gemini";
import { Plus } from "lucide-react";

export type ProcessingStep = "idle" | "converting" | "predicting";
export type ViewState = "dashboard" | "analysis";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [activeView, setActiveView] = useState<ViewState>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setProcessingStep("converting");
    
    // Create local URL for playback
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));

    // Simulate conversion time for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessingStep("predicting");

    try {
      const data = await analyzeAudio(file, geminiApiKey);
      setAnalysisData(data);
      setHistory(prev => [data, ...prev]);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Check your API key in Settings if you are using live mode.");
    } finally {
      setProcessingStep("idle");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && activeView !== "analysis") {
      setActiveView("analysis");
    }
  };

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    const fileNameMatch = item.metadata?.fileName?.toLowerCase().includes(query);
    const dangerMatch = item.dangerStatus.toLowerCase().includes(query);
    
    // Check if the query matches any emotion name and that emotion has a significant value (> 15%)
    const emotionMatch = Object.entries(item.emotions).some(([emotion, value]) => 
      emotion.toLowerCase().includes(query) && (value as number) > 15
    );

    return fileNameMatch || dangerMatch || emotionMatch;
  });

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav 
        onSettingsOpen={() => setIsSettingsOpen(true)} 
        searchTerm={searchQuery}
        onSearchChange={handleSearch}
      />
      <Sidebar 
        onSettingsOpen={() => setIsSettingsOpen(true)} 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="pt-24 pb-12 md:pl-72 pr-6 px-4 min-h-screen">
        {activeView === "dashboard" ? (
          <>
            {/* Header Section */}
            <section className="mb-10">
              <div className="max-w-4xl">
                <h1 className="font-geist text-5xl font-bold tracking-tight text-on-surface mb-3">
                  Acoustic Verification
                </h1>
                <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                  Execute high-precision forensic analysis on captured vocal data streams. 
                  Protocols are active for multi-modal frequency detection and deep neural sentiment attribution.
                </p>
              </div>
            </section>

            {/* Upload Area */}
            <section className="mb-8">
              <UploadZone 
                onUpload={handleFileUpload} 
                isAnalyzing={processingStep !== "idle"} 
                step={processingStep}
              />
            </section>

            {/* Visualization Suite */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ForensicMetrics 
                accuracy={analysisData?.accuracy} 
                emotions={analysisData?.emotions} 
              />
              <div className="lg:col-span-1">
                <DangerDetection 
                  status={analysisData?.dangerStatus} 
                  score={analysisData?.dangerScore} 
                />
              </div>
            </section>

            {/* Full Width Waveform Control */}
            <section className="mb-8">
              <AudioVisualizer 
                metadata={analysisData?.metadata} 
                audioUrl={audioUrl}
              />
            </section>
          </>
        ) : (
          <AnalysisHistory 
            items={filteredHistory} 
            searchTerm={searchQuery} 
            onSearchChange={handleSearch}
          />
        )}

        {/* Floating Action for Mobile */}
        <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-on-primary z-50 hover:scale-105 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={geminiApiKey}
        onApiKeyChange={setGeminiApiKey}
      />
    </div>
  );
}
