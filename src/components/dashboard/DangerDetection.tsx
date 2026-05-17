import { ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

interface DangerDetectionProps {
  status?: "CALM" | "DANGER";
  score?: number;
}

export function DangerDetection({ status = "CALM", score = 12 }: DangerDetectionProps) {
  const isDanger = status === "DANGER";
  
  return (
    <div className="glass-panel rounded-2xl p-8 flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between w-full mb-8 relative z-10">
        <h3 className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-geist">Danger Detection</h3>
        <Zap className={`${isDanger ? 'text-error' : 'text-secondary'} w-4 h-4`} />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative z-10">
        <motion.div 
          animate={{ 
            scale: isDanger ? [1, 1.1, 1] : 1,
            opacity: isDanger ? [0.6, 1, 0.6] : 1
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
            isDanger 
              ? 'bg-error/20 border-2 border-error shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
              : 'bg-secondary/20 border-2 border-secondary shadow-[0_0_30px_rgba(0,220,229,0.2)]'
          }`}
        >
          {isDanger ? (
            <ShieldAlert className="w-16 h-16 text-error" />
          ) : (
            <ShieldCheck className="w-16 h-16 text-secondary" />
          )}
        </motion.div>

        <div className="text-center">
          <h2 className={`text-4xl font-geist font-black tracking-tighter mb-2 ${
            isDanger ? 'text-error animate-pulse' : 'text-secondary'
          }`}>
            {status}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">
            Threat Assessment Level
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-3 relative z-10">
        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1">
          <span className="text-on-surface-variant">Stress Voltage</span>
          <span className={isDanger ? 'text-error' : 'text-on-surface'}>{score}%</span>
        </div>
        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`h-full ${isDanger ? 'bg-error shadow-[0_0_10px_#ef4444]' : 'bg-secondary shadow-[0_0_10px_#00dce5]'}`}
          />
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 ${
        isDanger ? 'bg-error/20' : 'bg-secondary/10'
      }`} />
    </div>
  );
}
