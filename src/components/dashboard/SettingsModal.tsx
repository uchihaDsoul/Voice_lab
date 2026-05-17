import { X, Save, Sliders, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="font-geist text-xl font-bold">Analysis Settings</h2>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Neural Models</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-secondary" />
                      <div>
                        <div className="text-sm font-semibold">Danger Recognition</div>
                        <div className="text-[10px] text-on-surface-variant uppercase">danger_model.keras</div>
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/10 bg-surface-variant text-primary focus:ring-primary" />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-tertiary" />
                      <div>
                        <div className="text-sm font-semibold">Emotional Attribution</div>
                        <div className="text-[10px] text-on-surface-variant uppercase">emotion_model.keras</div>
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/10 bg-surface-variant text-primary focus:ring-primary" />
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Processing</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-convert to WAV</span>
                  <div className="relative w-12 h-6 bg-surface-variant rounded-full p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-primary rounded-full ml-auto shadow-[0_0_8px_rgba(46,91,255,0.6)]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Precision Forensic Mode</span>
                  <div className="relative w-12 h-6 bg-primary/20 rounded-full p-1 cursor-pointer border border-primary/30">
                    <div className="w-4 h-4 bg-primary rounded-full ml-auto" />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-surface/50 border-t border-white/5 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-geist font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={onClose} className="flex-[2] py-3 px-4 rounded-xl font-geist font-bold text-sm bg-primary-container text-on-primary-container hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(46,91,255,0.3)]">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
