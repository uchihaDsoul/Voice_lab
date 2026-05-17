import { Search, Settings } from "lucide-react";

interface TopNavProps {
  onSettingsOpen: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function TopNav({ onSettingsOpen, searchTerm, onSearchChange }: TopNavProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(46,91,255,0.1)] flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-4">
        <span className="font-geist text-2xl font-bold tracking-tight text-primary">Voice Lab</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            className="bg-surface-variant/50 border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
            placeholder="Search experiments..."
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onSettingsOpen}
            className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 p-2 rounded-lg hover:bg-white/5"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
