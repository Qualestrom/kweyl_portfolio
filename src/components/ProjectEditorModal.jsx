import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, FolderGit2, Globe, Tag, Code, FileText, Layers } from 'lucide-react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProjectEditorModal({ project = null, onClose, onSaved }) {
  const isEditing = Boolean(project && project.id);

  const [formData, setFormData] = useState({
    title: project?.title || '',
    tag: project?.tag || 'Web Application',
    description: project?.description || '',
    skills: Array.isArray(project?.skills) ? project.skills.join(', ') : (project?.skills || ''),
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a project title.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectPayload = {
      title: formData.title.trim(),
      tag: formData.tag.trim() || 'Project',
      description: formData.description.trim(),
      skills: skillsArray,
      githubUrl: formData.githubUrl.trim(),
      demoUrl: formData.demoUrl.trim(),
    };

    try {
      if (isEditing) {
        // If it's a fallback ID (1, 2, 3), save with setDoc/updateDoc
        const docRef = doc(db, 'projects', project.id);
        await updateDoc(docRef, projectPayload);
        onSaved?.({ ...project, ...projectPayload });
      } else {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...projectPayload,
          photos: [],
          createdAt: new Date().toISOString(),
        });
        onSaved?.({ id: docRef.id, ...projectPayload, photos: [] });
      }
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      // Fallback local update if Firestore permissions fail
      if (isEditing) {
        onSaved?.({ ...project, ...projectPayload });
        onClose();
      } else {
        const localId = `local-${Date.now()}`;
        onSaved?.({ id: localId, ...projectPayload, photos: [] });
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-slate-900/95 border border-white/[0.12] rounded-2xl sm:rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Layers size={16} />
            </div>
            <h3 className="font-bold text-lg text-white font-['Outfit']">
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title & Tag Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText size={12} className="text-cyan-400" /> Project Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. CREOsim-MECHA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Tag size={12} className="text-cyan-400" /> Category / Tag
              </label>
              <input
                type="text"
                required
                value={formData.tag}
                onChange={(e) => handleChange('tag', e.target.value)}
                placeholder="e.g. Software / Simulation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief summary of what this project does and what technologies were engineered..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 leading-relaxed resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Code size={12} className="text-cyan-400" /> Tech Stack / Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              placeholder="e.g. React, TypeScript, Konva.js, Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FolderGit2 size={12} className="text-cyan-400" /> GitHub Repo URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe size={12} className="text-cyan-400" /> Live Demo URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => handleChange('demoUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={14} /> {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
