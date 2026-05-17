import { CloudUpload, RefreshCw, Loader2, Cpu, FileAudio } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProcessingStep } from "@/src/App";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
  step: ProcessingStep;
}

export function UploadZone({ onUpload, isAnalyzing, step }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);

  const handleFile = (files: FileList | null) => {
    if (files && files.length > 0) {
      setLastUploaded(files[0].name);
      onUpload(files[0]);
    }
  };

  return (
    <div className="group relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files)}
        accept="audio/*"
        className="hidden"
      />
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files); }}
        className={`glass-panel rounded-2xl p-12 flex flex-col items-center justify-center border-dashed border-2 transition-all cursor-pointer overflow-hidden min-h-[320px] ${
          isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-primary/30 hover:border-primary/60'
        }`}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-tertiary/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CloudUpload className="text-primary w-8 h-8" />
                </div>
                <h3 className="font-geist text-2xl font-bold mb-2">
                  {lastUploaded ? "Audio Uploaded Successfully" : "Drop Audio Streams Here"}
                </h3>
                <p className="text-sm text-on-surface-variant mb-10 font-medium max-w-xs">
                  {lastUploaded 
                    ? `Ready for forensic analysis: ${lastUploaded}` 
                    : "Supports FLAC, MP3, OGG (Max 500MB)"}
                </p>
                
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <button className="bg-primary-container text-on-primary-container px-10 py-3 rounded-full font-geist text-sm font-semibold hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] transition-all active:scale-95">
                    Upload Audio
                  </button>
                  <div className="flex items-center gap-2 bg-surface-variant/40 px-4 py-2 rounded-full border border-white/5">
                    <RefreshCw className="w-3.5 h-3.5 text-secondary animate-spin-slow" />
                    <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Auto-converting to .WAV</span>
                  </div>
                </div>
              </motion.div>
            ) : step === "converting" ? (
              <motion.div
                key="converting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 mb-6 flex items-center justify-center relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full"
                  />
                  <FileAudio className="text-primary w-8 h-8 animate-pulse" />
                </div>
                <h3 className="font-geist text-2xl font-bold mb-2">Forensic Conversion</h3>
                <p className="text-sm text-on-surface-variant mb-6 font-medium">Re-encoding stream to uncompressed pulse-code modulation...</p>
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-primary shadow-[0_0_10px_#2e5bff]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="predicting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 mb-6 flex items-center justify-center relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 bg-secondary/10 border border-secondary/30 rounded-full blur-xl"
                  />
                  <Cpu className="text-secondary w-8 h-8 animate-bounce" />
                </div>
                <h3 className="font-geist text-2xl font-bold mb-2">Neural Prediction</h3>
                <p className="text-sm text-on-surface-variant mb-6 font-medium">Intersecting danger_model and emotion_model payloads...</p>
                
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 24, 8] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                      className="w-1 bg-secondary rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
