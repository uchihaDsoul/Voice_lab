import { Play, Pause, Download, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface AudioMetadata {
  fileName: string;
  sampleRate: string;
  bitDepth: string;
  captureDate: string;
}

interface AudioVisualizerProps {
  metadata?: AudioMetadata;
  audioUrl?: string | null;
}

export function AudioVisualizer({ metadata, audioUrl }: AudioVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const displayMetadata = metadata ?? {
    fileName: "Forensic_Stream_09.wav",
    sampleRate: "192 kHz",
    bitDepth: "32-bit",
    captureDate: "OCT 24, 2023 | 02:14:05 UTC"
  };

  const bars = Array.from({ length: 48 }, (_, i) => ({
    baseHeight: Math.floor(Math.random() * 60) + 20,
    color: i > 35 ? "bg-secondary" : "bg-primary"
  }));

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-panel rounded-2xl p-8">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
        <div className="flex items-center gap-5">
          <button 
            onClick={handlePlayPause}
            disabled={!audioUrl}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl ${
              audioUrl 
                ? "bg-primary text-on-primary hover:scale-105 shadow-[0_0_20px_rgba(46,91,255,0.4)]" 
                : "bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50"
            }`}
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
          <div>
            <h4 className="font-geist text-xl font-bold text-on-surface">{displayMetadata.fileName}</h4>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-[0.2em] uppercase mt-1">
              RECORDING STATUS: {audioUrl ? "LOADED" : "AWAITING STREAM"} | {displayMetadata.captureDate}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 bg-surface-variant/30 px-8 py-4 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mb-1">Frequency</span>
            <span className="text-sm font-geist font-bold text-secondary">{displayMetadata.sampleRate}</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mb-1">Quantization</span>
            <span className="text-sm font-geist font-bold text-secondary">{displayMetadata.bitDepth}</span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex gap-4">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-40 w-full flex items-end justify-between gap-[4px] px-2 group cursor-pointer overflow-hidden rounded-xl bg-black/20">
        <div 
          className="absolute left-0 top-0 h-full bg-primary/20 border-r-2 border-primary z-10 pointer-events-none transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        
        {bars.map((bar, i) => {
          const isPast = (i / bars.length) * 100 < progress;
          return (
            <motion.div
              key={i}
              animate={{ 
                height: isPlaying ? [bar.baseHeight, bar.baseHeight * 0.4, bar.baseHeight * 1.4, bar.baseHeight] : bar.baseHeight 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.8 + (Math.random() * 0.4), 
                delay: i * 0.02,
                ease: "easeInOut" 
              }}
              className={`flex-1 rounded-t-full ${bar.color} transition-all duration-300 ${
                isPast ? "opacity-100 brightness-125" : "opacity-30"
              }`}
              style={{ height: `${bar.baseHeight}%` }}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-6 font-geist text-[10px] text-on-surface-variant font-mono tracking-[0.2em] uppercase font-bold">
        <span>0:00:00</span>
        <div className="flex gap-8">
          <span className="text-primary">Position: {formatTime(currentTime)}</span>
          <span className="text-on-surface-variant opacity-40">Total: {formatTime(duration)}</span>
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
