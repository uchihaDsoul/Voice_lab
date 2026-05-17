import { ShieldCheck, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";

interface EmotionData {
  angry: number;
  calm: number;
  disgust: number;
  fear: number;
  happy: number;
  neutral: number;
  sad: number;
  surprised: number;
}

interface ForensicMetricsProps {
  accuracy?: number;
  emotions?: EmotionData;
}

export function ForensicMetrics({ accuracy = 98.4, emotions }: ForensicMetricsProps) {
  const displayEmotions = emotions ?? {
    angry: 12,
    calm: 45,
    disgust: 5,
    fear: 8,
    happy: 15,
    neutral: 10,
    sad: 3,
    surprised: 2,
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  const emotionList = Object.entries(displayEmotions).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: getEmotionColor(key),
  }));

  return (
    <div className="lg:col-span-2 glass-panel rounded-2xl p-8 flex flex-col md:flex-row gap-10">
      {/* Accuracy Section */}
      <div className="flex flex-col items-center justify-center border-r border-white/5 pr-10">
        <div className="flex justify-between w-full mb-6">
          <h3 className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-geist">Verification</h3>
          <ShieldCheck className="text-primary w-4 h-4" />
        </div>
        
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="rgba(30, 32, 36, 1)"
              strokeWidth="10"
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="url(#accGrad)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(46,91,255,0.5)]"
            />
            <defs>
              <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e5bff" />
                <stop offset="100%" stopColor="#b8c3ff" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="flex flex-col items-center z-10">
            <span className="font-geist text-4xl font-bold text-on-surface">
              {accuracy}<span className="text-xl opacity-70">%</span>
            </span>
            <span className="text-[9px] tracking-[0.2em] text-primary font-bold mt-1 uppercase">Confidence</span>
          </div>
        </div>
        
        <div className="mt-8 text-center bg-white/5 p-4 rounded-xl border border-white/5 w-full">
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Status</div>
          <div className="font-geist text-sm font-bold text-secondary uppercase">Authenticated</div>
        </div>
      </div>

      {/* Emotions Section */}
      <div className="flex-1">
        <div className="flex justify-between w-full mb-8">
          <h3 className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-geist">Emotional Attribution</h3>
          <BrainCircuit className="text-tertiary w-4 h-4" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {emotionList.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-[11px] font-geist uppercase tracking-wider">
                <span className="text-on-surface-variant">{item.label}</span>
                <span className="text-on-surface font-bold">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getEmotionColor(emotion: string): string {
  switch (emotion) {
    case 'angry': return 'bg-error shadow-[0_0_8px_#ffb4ab]';
    case 'happy': return 'bg-secondary shadow-[0_0_8px_#00dce5]';
    case 'fear': return 'bg-tertiary shadow-[0_0_8px_#ecb2ff]';
    case 'surprised': return 'bg-primary shadow-[0_0_8px_#2e5bff]';
    case 'calm': return 'bg-green-400 shadow-[0_0_8px_#4ade80]';
    case 'neutral': return 'bg-gray-400 shadow-[0_0_8px_#9ca3af]';
    case 'sad': return 'bg-blue-400 shadow-[0_0_8px_#60a5fa]';
    case 'disgust': return 'bg-orange-400 shadow-[0_0_8px_#fb923c]';
    default: return 'bg-primary';
  }
}
