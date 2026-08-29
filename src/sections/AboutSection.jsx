import React, { useState } from 'react';
import { 
  Terminal, 
  Smartphone, 
  Cloud, 
  Layers, 
  ArrowRight, 
  Plus, 
  X
} from 'lucide-react';
import EditableText from '../components/EditableText';

// Predefined statuses the admin can cycle through
const STATUS_OPTIONS = [
  { label: 'Open to Work', available: true },
  { label: 'Open to Freelance', available: true },
  { label: 'Currently Employed', available: false },
  { label: 'Not Available', available: false },
];

export default function AboutSection({ config, isAdmin, onUpdateConfig, onNavigateContact }) {
  // Admin-only state for inline skill adding
  const [addingTo, setAddingTo] = useState(null);
  const [newSkillText, setNewSkillText] = useState('');

  // ── Config-driven content ──────────────────────────────────────────────
  const headline = config?.aboutTitle || "Software Developer";
  const paragraph = config?.aboutText1 
    ? (config.aboutText2 ? `${config.aboutText1}\n\n${config.aboutText2}` : config.aboutText1)
    : "I am a Computer Engineering graduate specializing in Software Development. I work with React for web front-ends and Flutter for cross-platform mobile applications.";

  const status = config?.aboutStatus || 'Open to Work';
  const statusOption = STATUS_OPTIONS.find(s => s.label === status);
  const isAvailable = statusOption?.available ?? true;

  // Skill arrays from config (with hardcoded fallbacks for first load)
  const softwareSkills = config?.aboutSoftwareSkills || ['React', 'TypeScript', 'C#'];
  const mobileSkills = config?.aboutMobileSkills || ['Flutter', 'Dart', 'React Native', 'PWA'];
  const cloudSkills = config?.aboutCloudSkills || ['Firebase', 'Supabase', 'Vercel'];
  const designSkills = config?.aboutDesignSkills || ['Figma', 'UI/UX', 'Git / CI/CD'];

  // ── Status cycling (admin only) ────────────────────────────────────────
  const cycleStatus = () => {
    const currentIndex = STATUS_OPTIONS.findIndex(s => s.label === status);
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    onUpdateConfig?.('aboutStatus', STATUS_OPTIONS[nextIndex].label);
  };

  // ── Skill management (admin only) ──────────────────────────────────────
  const handleAddSkill = (configKey, currentSkills) => {
    const trimmed = newSkillText.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      onUpdateConfig?.(configKey, [...currentSkills, trimmed]);
    }
    setNewSkillText('');
    setAddingTo(null);
  };

  const handleRemoveSkill = (configKey, currentSkills, skillToRemove) => {
    onUpdateConfig?.(configKey, currentSkills.filter(s => s !== skillToRemove));
  };

  // ── Reusable skill tags renderer ───────────────────────────────────────
  const renderSkillTags = (skills, configKey) => (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] inline-flex items-center gap-1.5 transition-colors duration-200 ${
            isAdmin ? 'hover:border-red-400/40 hover:bg-red-500/10' : 'hover:text-cyan-700 dark:hover:text-slate-100 hover:border-cyan-500/30 dark:hover:border-white/20'
          }`}
        >
          {skill}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleRemoveSkill(configKey, skills, skill)}
              className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all duration-150 cursor-pointer flex-shrink-0"
              title={`Remove ${skill}`}
            >
              <X size={8} />
            </button>
          )}
        </span>
      ))}

      {/* Admin: Add skill button */}
      {isAdmin && addingTo !== configKey && (
        <button
          type="button"
          onClick={() => { setAddingTo(configKey); setNewSkillText(''); }}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 border-dashed inline-flex items-center gap-1 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors cursor-pointer"
        >
          <Plus size={12} /> Add
        </button>
      )}

      {/* Admin: Inline input for new skill */}
      {isAdmin && addingTo === configKey && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleAddSkill(configKey, skills); }}
          className="inline-flex items-center gap-1"
        >
          <input
            type="text"
            value={newSkillText}
            onChange={(e) => setNewSkillText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setAddingTo(null); setNewSkillText(''); } }}
            autoFocus
            placeholder="Skill name"
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-950/80 text-slate-900 dark:text-white border border-cyan-500 outline-none w-28 placeholder:text-slate-400 shadow-sm"
          />
          <button
            type="submit"
            className="px-2 py-1 rounded-lg text-[11px] bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer font-bold"
            title="Press Enter to add"
          >
            ↵
          </button>
          <button
            type="button"
            onClick={() => { setAddingTo(null); setNewSkillText(''); }}
            className="px-1.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            title="Cancel"
          >
            <X size={10} />
          </button>
        </form>
      )}
    </div>
  );

  // ── Reusable skill card renderer ───────────────────────────────────────
  const renderSkillCard = (icon, title, number, skills, configKey) => (
    <div className="md:col-span-1 lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-slate-900/60 backdrop-blur-xl p-5 xl:p-5.5 flex flex-col justify-between shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-none hover:border-cyan-500/50 dark:hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(8,145,178,0.15)] dark:hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] transition-all duration-300 group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shadow-sm">
              {icon}
            </div>
            <h3 className="font-bold text-base xl:text-lg text-slate-900 dark:text-white font-['Outfit']">{title}</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-800 dark:text-cyan-400/80 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-2 py-0.5 rounded-md font-semibold">
            {number}
          </span>
        </div>
      </div>

      {/* Skill Tags */}
      <div>
        {renderSkillTags(skills, configKey)}
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <section className="section-viewport overflow-y-auto lg:overflow-hidden py-8 sm:py-10 lg:py-0" id="about-section">
      <div className="section-content w-full h-full flex items-center justify-center px-4 sm:px-8 lg:pl-32 xl:pl-44 lg:pr-12 xl:pr-16 max-w-[1480px]">
        
        {/* ─── 4-Column 2-Row Responsive Bento Grid ──────────────────────────── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3.5 xl:gap-4.5 h-auto lg:h-[460px] xl:h-[480px] my-auto">
          
          {/* ─────────────────────────────────────────────────────────────
              1. LARGE BIO CARD (Span 2 Columns, Span 2 Rows on Desktop)
             ───────────────────────────────────────────────────────────── */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white/95 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 xl:p-8 flex flex-col justify-between shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/50 dark:hover:border-cyan-400/40 transition-all duration-300 group">
            {/* Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />
            
            {/* Top Bar: Eyebrow + Status Badge */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                  About Me
                </div>

                {/* Status Badge — admin clicks to cycle, visitors see static */}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={cycleStatus}
                    title={`Click to change status • Current: ${status}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                      isAvailable
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                        : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'}`} />
                    {status}
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border ${
                      isAvailable
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20'
                        : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'}`} />
                    {status}
                  </span>
                )}
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-slate-900 dark:text-white mb-3.5 font-['Outfit'] leading-tight">
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
              <div className="text-slate-700 dark:text-slate-300/90 text-xs sm:text-sm lg:text-[0.925rem] leading-relaxed max-w-xl">
                {isAdmin ? (
                  <EditableText
                    text={paragraph}
                    isAdmin={isAdmin}
                    multiline={true}
                    onSave={(v) => onUpdateConfig?.({ aboutText1: v, aboutText2: '' })}
                  />
                ) : (
                  paragraph
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={onNavigateContact}
                className="btn-primary group cursor-pointer text-xs sm:text-sm py-2.5 px-6"
              >
                Let's Connect
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                Computer Engineering // Software Development
              </span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. SOFTWARE CARD (Row 1, Col 3 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          {renderSkillCard(<Terminal size={17} />, 'Software', '01', softwareSkills, 'aboutSoftwareSkills')}

          {/* ─────────────────────────────────────────────────────────────
              3. MOBILE CARD (Row 1, Col 4 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          {renderSkillCard(<Smartphone size={17} />, 'Mobile', '02', mobileSkills, 'aboutMobileSkills')}

          {/* ─────────────────────────────────────────────────────────────
              4. CLOUD CARD (Row 2, Col 3 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          {renderSkillCard(<Cloud size={17} />, 'Cloud', '03', cloudSkills, 'aboutCloudSkills')}

          {/* ─────────────────────────────────────────────────────────────
              5. DESIGN & TOOLS CARD (Row 2, Col 4 on Desktop)
             ───────────────────────────────────────────────────────────── */}
          {renderSkillCard(<Layers size={17} />, 'Design', '04', designSkills, 'aboutDesignSkills')}

        </div>
      </div>
    </section>
  );
}
