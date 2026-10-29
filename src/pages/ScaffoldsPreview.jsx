import React, { useState } from 'react';
import { 
  ProjectsScaffold, 
  CertificatesScaffold, 
  HeroScaffold, 
  AboutScaffold 
} from '../components/common/LoadingScaffold';

export default function ScaffoldsPreview() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex flex-col p-6 sm:p-10 font-['Outfit']">
      {/* Top Header & Scaffold Switcher */}
      <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-cyan-500/20 relative z-20">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            SNEZHNAYAN DESIGN SYSTEM
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Crystalline Loading Scaffolds
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 p-1.5 rounded-xl">
          {[
            { id: 'projects', label: 'Projects Scaffold' },
            { id: 'certificates', label: 'Credentials Scaffold' },
            { id: 'hero', label: 'Hero Scaffold' },
            { id: 'about', label: 'About Scaffold' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scaffold Display Area */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-center py-10">
        {activeTab === 'projects' && <ProjectsScaffold />}
        {activeTab === 'certificates' && <CertificatesScaffold />}
        {activeTab === 'hero' && <HeroScaffold />}
        {activeTab === 'about' && <AboutScaffold />}
      </div>
    </div>
  );
}
