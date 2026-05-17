import { 
  BarChart3, 
  AudioLines, 
  Settings as SettingsIcon, 
  Plus, 
  BookOpen, 
  Headphones,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ViewState } from "../../App";

interface SidebarProps {
  onSettingsOpen: () => void;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export function Sidebar({ onSettingsOpen, activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "analysis", icon: AudioLines, label: "Analysis" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-low/70 backdrop-blur-2xl border-r border-white/5 flex flex-col py-4 gap-2 z-40 hidden md:flex">
      <div className="px-6 mb-6">
        <h2 className="font-geist text-xl font-semibold text-primary">Analyst Terminal</h2>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">V-01 Protocol</p>
      </div>
      
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.id === "settings") {
                  onSettingsOpen();
                } else {
                  onViewChange(item.id as ViewState);
                }
              }}
              className={cn(
                "group flex items-center justify-between py-3.5 px-6 transition-all duration-300 border-r-2 text-left w-full",
                isActive 
                  ? "bg-primary-container/10 text-primary border-primary" 
                  : "text-on-surface-variant hover:bg-white/5 border-transparent hover:text-on-surface"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                <span className="font-geist text-sm font-medium">{item.label}</span>
              </div>
              {isActive && (
                <ChevronRight className="w-4 h-4 opacity-50" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-6 pb-6 flex flex-col gap-4">
        <button 
          onClick={() => onViewChange("dashboard")}
          className="w-full py-3 bg-primary-container text-on-primary-container font-geist text-sm font-medium rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
        
        <div className="border-t border-white/5 pt-4 flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface py-2 text-xs transition-colors">
            <BookOpen className="w-4 h-4" />
            Documentation
          </a>
          <a href="#" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface py-2 text-xs transition-colors">
            <Headphones className="w-4 h-4" />
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}
