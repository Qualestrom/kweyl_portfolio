import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, FolderGit2, Globe, Tag, Code, FileText, Layers,
  Plus, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { detectImageOrientation } from '../utils/imageUtils';

export default function ProjectEditorInline({ 
  project = null, 
  onClose, 
  onSaved,
  onUploadPhoto, // (projectId, file) => Promise<void>
  onRemovePhoto, // (projectId, photoUrl) => Promise<void>
  uploading = false
}) {
  const isEditing = Boolean(project && project.id);

  const [formData, setFormData] = useState({
    title: project?.title || '',
    tag: project?.tag || '',
    description: project?.description || '',
    skills: Array.isArray(project?.skills) ? project.skills.join(', ') : (project?.skills || ''),
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Photo management state
  const photos = project?.photos || [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  
  // Detect orientation when photos change
  useEffect(() => {
    if (photos.length > 0) {
      detectImageOrientation(photos[0]).then(detected => {
        setOrientation(detected);
      });
    } else {
      setOrientation('landscape'); // Default for no photos
    }
  }, [photos]);

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
    } catch (err) {
      console.error('Error saving project:', err);
      // Fallback local update if Firestore permissions fail
      if (isEditing) {
        onSaved?.({ ...project, ...projectPayload });
      } else {
        const localId = `local-${Date.now()}`;
        onSaved?.({ id: localId, ...projectPayload, photos: [] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content for the photo viewer/uploader
  const renderPhotoSection = () => {
    return (
      <div className={`relative w-full overflow-hidden border border-white/[0.08] bg-slate-950/60 rounded-xl lg:rounded-2xl flex-shrink-0
        ${orientation === 'portrait' ? 'h-full aspect-[9/19] max-w-[280px] mx-auto' : 'h-[180px] sm:h-[200px] w-full'}
      `}>
        {photos && photos.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                src={photos[activeSlide]}
                alt="Project screenshot"
                className={`w-full h-full object-cover object-center ${orientation === 'portrait' ? 'object-top' : ''}`}
              />
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setActiveSlide(prev => (prev - 1 + photos.length) % photos.length); }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center hover:bg-cyan-500/40 transition-colors cursor-pointer backdrop-blur-md z-10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setActiveSlide(prev => (prev + 1) % photos.length); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center hover:bg-cyan-500/40 transition-colors cursor-pointer backdrop-blur-md z-10"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.preventDefault(); setActiveSlide(i); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        activeSlide === i ? 'bg-cyan-400 w-4' : 'bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Admin Photo Controls */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
              <label
                title="Add screenshot"
                className="p-1.5 rounded-lg bg-slate-950/80 border border-white/20 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer backdrop-blur-md transition-colors"
              >
                <Plus size={13} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files?.[0] && onUploadPhoto) {
                      onUploadPhoto(project.id, e.target.files[0]);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const currentUrl = photos[activeSlide];
                  if (currentUrl && onRemovePhoto) {
                    onRemovePhoto(project.id, currentUrl);
                    setActiveSlide(0);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-red-500/30 text-red-400 hover:bg-red-500/30 cursor-pointer backdrop-blur-md transition-colors"
                title="Delete current screenshot"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-cyan-400/50 mb-2">
              <ImageIcon size={22} />
            </div>
            <span className="text-xs font-mono tracking-wider text-slate-400 text-center">
              {isEditing ? 'No Screenshots Yet' : 'Save project first to add photos'}
            </span>
            {isEditing && (
              <label className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5">
                <Plus size={13} />
                <span>{uploading ? 'Uploading...' : 'Add Screenshot'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files?.[0] && onUploadPhoto) {
                      onUploadPhoto(project.id, e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-cyan-300 text-xs font-mono z-30">
            Uploading...
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] lg:border-cyan-500/30 rounded-2xl lg:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Layers size={14} />
          </div>
          <h3 className="font-bold text-base text-white font-['Outfit']">
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Close Editor"
        >
          <X size={16} />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className={`flex-1 overflow-y-auto p-5 sm:p-6 text-sm ${orientation === 'portrait' ? 'flex flex-col sm:flex-row-reverse gap-6' : 'flex flex-col gap-5'}`}>
          
          {/* Photo Section */}
          <div className={`${orientation === 'portrait' ? 'sm:w-1/3 shrink-0' : 'w-full shrink-0'}`}>
            {renderPhotoSection()}
          </div>

          {/* Form Fields */}
          <div className={`space-y-4 ${orientation === 'portrait' ? 'sm:w-2/3' : 'w-full'}`}>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FileText size={12} className="text-cyan-400" /> Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. CREOsim-MECHA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} className="text-cyan-400" /> Category
                </label>
                <input
                  type="text"
                  required
                  value={formData.tag}
                  onChange={(e) => handleChange('tag', e.target.value)}
                  placeholder="e.g. Software / Simulation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief summary of what this project does..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 leading-relaxed resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Code size={12} className="text-cyan-400" /> Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g. React, TypeScript"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FolderGit2 size={12} className="text-cyan-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 text-xs"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-slate-600 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/[0.08] bg-slate-950/40 shrink-0">
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
  );
}
