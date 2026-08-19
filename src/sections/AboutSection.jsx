import React, { useState } from 'react';
import { 
  Terminal, 
  Smartphone, 
  Cloud, 
  Layers, 
  ArrowRight, 
  Check, 
  RefreshCw
} from 'lucide-react';
import EditableText from '../components/EditableText';

export default function AboutSection({ config, isAdmin, onUpdateConfig, onNavigateContact }) {
  // Interactive states for each Bento container
  const [softwareActiveSkill, setSoftwareActiveSkill] = useState('React');
  const [mobileActiveSkill, setMobileActiveSkill] = useState('Flutter');
  const [cloudActiveSkill, setCloudActiveSkill] = useState('Firebase');
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(24);
  const [designActiveSkill, setDesignActiveSkill] = useState('Figma');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const headline = config?.aboutTitle || "The Architect.";
  const paragraph = config?.aboutText1 
    ? (config.aboutText2 ? `${config.aboutText1}\n\n${config.aboutText2}` : config.aboutText1)
    : "I am a Computer Engineering graduate specializing in Software Development. My philosophy is simple: complex problems require elegant, scalable software solutions. From architecting robust React front-ends to building cross-platform Flutter applications, I build end-to-end digital systems that perform flawlessly.";

  // Software details mapping
  const softwareDetails = {
    'React': 'React 19 • Concurrent UI & Virtual DOM',
    'TypeScript': 'Strict 0-any • Bulletproof Contracts',
    'C#': '.NET Core • High-Throughput OOP'
  };

  // Mobile details mapping
  const mobileDetails = {
    'Flutter': 'Compiled Native ARM • 60-120fps Engine',
    'Dart': 'Sound Null Safety • Reactive Streams',
    'React Native': 'Native Bridges • Shared JS Logic',
    'PWA': 'Offline Caching & Service Workers'
  };

  // Cloud details mapping
  const cloudDetails = {
    'Firebase': { latency: 18, desc: 'Real-time NoSQL & Auth Streams' },
    'Supabase': { latency: 24, desc: 'PostgreSQL & Edge Functions' },
    'Vercel': { latency: 12, desc: 'Global Edge & Automated CI/CD' }
  };

  // Design details mapping
  const designDetails = {
    'Figma': 'Auto-layout & responsive design systems',
    'UI/UX': 'Human-centered heuristics & fluid flows',
    'Git / CI/CD': 'Automated testing, linting & deployment'
  };

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(Math.random() * 15) + 12);
      setIsPinging(false);
    }, 400);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText?.("chrislamera0408@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section className="section-viewport overflow-y-auto lg:overflow-hidden py-10 lg:py-0" id="about-section">
      <div className="section-content w-full h-full flex items-center justify-center pl-6 sm:pl-10 lg:pl-32 xl:pl-44 pr-6 sm:pr-10 lg:pr-12 xl:pr-16 max-w-[1480px]">
        
        {/* ─── 4-Column 2-Row Responsive Bento Grid ──────────────────────────── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3.5 xl:gap-4.5 h-auto lg:h-[460px] xl:h-[480px] my-auto">
          
          {/* ─────────────────────────────────────────────────────────────
              1. LARGE BIO CARD (Span 2 Columns, Span 2 Rows on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 xl:p-8 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-400/40 transition-all duration-300 group">
            {/* Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />
            
            {/* Top Bar: Eyebrow + Interactive Status Badge */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  About Me
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Click to copy email address"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {copiedEmail ? (
                    <>
                      <Check size={11} /> Copied!
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Open to Projects
                    </>
                  )}
                </button>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-white mb-3.5 font-['Outfit'] leading-tight">
                {isAdmin ? (
                  <EditableText
                    text={headline}
                    isAdmin={isAdmin}
                    onSave={(v) => onUpdateConfig?.('aboutTitle', v)}
                  />
                ) : (
                  headline
                )}
              </h2>

              {/* Bio Paragraph */}
              <div className="text-slate-300/90 text-xs sm:text-sm lg:text-[0.925rem] leading-relaxed max-w-xl">
                {isAdmin ? (
                  <EditableText
                    text={paragraph}
                    isAdmin={isAdmin}
                    multiline={true}
                    onSave={(v) => onUpdateConfig?.('aboutText1', v)}
                  />
                ) : (
                  paragraph
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onNavigateContact}
                className="btn-primary group cursor-pointer text-xs sm:text-sm py-2.5 px-6"
              >
                Let's Connect
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                Comp Engineering // Software Spec
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. SOFTWARE CARD (Row 1, Col 3 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 xl:p-5.5 flex flex-col justify-between hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] transition-all duration-300 group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                    <Terminal size={17} />
                  </div>
                  <h3 className="font-bold text-base xl:text-lg text-white font-['Outfit']">Software</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  01
                </span>
              </div>

              {/* Interactive Live Output Badge */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-cyan-200/90 mb-2 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{`>`}</span>
                <span className="text-[11px] leading-snug">
                  {softwareDetails[softwareActiveSkill]}
                </span>
              </div>
            </div>

            {/* Interactive Clickable Tech Stack Tags */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Click to inspect
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'TypeScript', 'C#'].map((skill) => {
                  const isSelected = softwareActiveSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSoftwareActiveSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(103,232,249,0.2)]'
                          : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. MOBILE CARD (Row 1, Col 4 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 xl:p-5.5 flex flex-col justify-between hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] transition-all duration-300 group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                    <Smartphone size={17} />
                  </div>
                  <h3 className="font-bold text-base xl:text-lg text-white font-['Outfit']">Mobile</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  02
                </span>
              </div>

              {/* Interactive Live Engine Output */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-cyan-200/90 mb-2 flex items-center justify-between">
                <span className="text-[11px] leading-snug">
                  {mobileDetails[mobileActiveSkill]}
                </span>
              </div>
            </div>

            {/* Interactive Clickable Platform Tags */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Click to inspect
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Flutter', 'Dart', 'React Native', 'PWA'].map((skill) => {
                  const isSelected = mobileActiveSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setMobileActiveSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(103,232,249,0.2)]'
                          : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. CLOUD CARD (Row 2, Col 3 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 xl:p-5.5 flex flex-col justify-between hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] transition-all duration-300 group">
            <div>
              {/* Header with Ping Action */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                    <Cloud size={17} />
                  </div>
                  <h3 className="font-bold text-base xl:text-lg text-white font-['Outfit']">Cloud</h3>
                </div>

                <button
                  type="button"
                  onClick={handlePing}
                  title="Ping cloud edge network"
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md hover:bg-cyan-500/20 transition-colors cursor-pointer"
                >
                  <RefreshCw size={10} className={isPinging ? 'animate-spin' : ''} />
                  {isPinging ? 'Pinging...' : `${pingLatency}ms`}
                </button>
              </div>

              {/* Interactive Live Region Status */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-cyan-200/90 mb-2 flex items-center justify-between">
                <span className="text-[11px] leading-snug">
                  {cloudDetails[cloudActiveSkill]?.desc}
                </span>
              </div>
            </div>

            {/* Interactive Clickable Services */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Click to inspect
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Firebase', 'Supabase', 'Vercel'].map((skill) => {
                  const isSelected = cloudActiveSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        setCloudActiveSkill(skill);
                        setPingLatency(cloudDetails[skill]?.latency || 20);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(103,232,249,0.2)]'
                          : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. DESIGN CARD (Row 2, Col 4 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 xl:p-5.5 flex flex-col justify-between hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] transition-all duration-300 group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                    <Layers size={17} />
                  </div>
                  <h3 className="font-bold text-base xl:text-lg text-white font-['Outfit']">Design</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  04
                </span>
              </div>

              {/* Interactive Step Preview */}
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono text-cyan-200/90 mb-2 flex items-center justify-between">
                <span className="text-[11px] leading-snug">
                  {designDetails[designActiveSkill]}
                </span>
              </div>
            </div>

            {/* Interactive Clickable Workflow Tags */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Click to inspect
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Figma', 'UI/UX', 'Git / CI/CD'].map((skill) => {
                  const isSelected = designActiveSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setDesignActiveSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(103,232,249,0.2)]'
                          : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
