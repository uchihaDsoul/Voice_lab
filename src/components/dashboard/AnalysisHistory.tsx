import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileAudio, ShieldCheck, ShieldAlert, ChevronRight, Info } from "lucide-react";

interface AnalysisItem {
  accuracy: number;
  dangerStatus: "CALM" | "DANGER";
  dangerScore: number;
  emotions: Record<string, number>;
  metadata: {
    fileName: string;
    captureDate: string;
    sampleRate: string;
    bitDepth: string;
  };
}

interface AnalysisHistoryProps {
  items: AnalysisItem[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function AnalysisHistory({ items, searchTerm, onSearchChange }: AnalysisHistoryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const emotions = ["Angry", "Calm", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprised", "Stressed", "Bored"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="font-geist text-5xl font-bold tracking-tight text-on-surface mb-3">
          Neural History
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
          {searchTerm 
            ? `Showing results for "${searchTerm}" across the forensic archive.`
            : "Review previous forensic analysis payloads. Hover over any stream to preview its emotional signature and danger assessment."}
        </p>
      </header>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => onSearchChange("")}
          className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
            !searchTerm 
              ? "border-primary bg-primary/10 text-primary" 
              : "border-white/10 bg-white/5 text-on-surface-variant hover:border-primary/50"
          }`}
        >
          All
        </button>
        {emotions.map(emotion => {
          const isActive = searchTerm.toLowerCase() === emotion.toLowerCase();
          return (
            <button
              key={emotion}
              onClick={() => onSearchChange(emotion)}
              className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-white/10 bg-white/5 text-on-surface-variant hover:border-primary/50"
              }`}
            >
              {emotion}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-2xl p-20 flex flex-col items-center text-center opacity-50">
          <Info className="w-12 h-12 mb-4 text-on-surface-variant" />
          <h3 className="text-xl font-bold mb-2">
            {searchTerm ? "No Matches Found" : "No Records Found"}
          </h3>
          <p className="text-sm">
            {searchTerm 
              ? `Verification query for "${searchTerm}" returned zero spectral matches.`
              : "Upload audio streams in the Dashboard to begin forensic archiving."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index}
              className="relative group lg:w-2/3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Main List Item */}
              <div className="glass-panel rounded-xl p-6 border border-white/5 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between group-hover:bg-white/5">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.dangerStatus === "DANGER" ? "bg-error/20 text-error" : "bg-primary/20 text-primary"
                  }`}>
                    <FileAudio className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-geist font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.metadata.fileName}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-1">
                      {item.metadata.captureDate} | {item.metadata.sampleRate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-on-surface">{item.accuracy}%</div>
                    <div className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter">Confidence</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>

              {/* Hover Popup */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="absolute left-[calc(100%+24px)] top-0 w-80 z-[60] glass-panel rounded-2xl p-6 shadow-2xl border border-primary/30 pointer-events-none hidden lg:block"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Stream Summary</span>
                      {item.dangerStatus === "DANGER" ? (
                        <ShieldAlert className="w-4 h-4 text-error" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-secondary" />
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`text-2xl font-geist font-black tracking-tighter ${
                            item.dangerStatus === "DANGER" ? "text-error" : "text-secondary"
                          }`}>
                            {item.dangerStatus}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-on-surface-variant">Danger Level: {item.dangerScore}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-geist font-bold text-primary">{item.accuracy}%</div>
                          <div className="text-[9px] uppercase font-bold text-on-surface-variant">AI Accuracy</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant border-b border-white/5 pb-2">Dominant Emotions</div>
                        {Object.entries(item.emotions)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([emotion, value]) => (
                            <div key={emotion} className="space-y-1">
                              <div className="flex justify-between text-[10px] uppercase font-bold">
                                <span>{emotion}</span>
                                <span>{Math.round(value)}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Arrow Pointer */}
                    <div className="absolute top-8 -left-2 w-4 h-4 bg-[#1e2024] border-l border-t border-primary/30 rotate-[-45deg]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
