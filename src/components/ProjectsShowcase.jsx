import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  FolderGit2, 
  Globe, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  X,
  Orbit,
  LayoutGrid
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import EditableText from './EditableText';
import StellarCardGallerySingle from './ui/3d-image-gallery';

const DEFAULT_PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', // Mecha / simulation
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80', // Mobile / app
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', // Analytics / web
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', // Abstract 3d
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', // Matrix code
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', // Modern workspace
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', // Silicon hardware
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', // Orbital node
];

const FALLBACK_PROJECTS = [
  {
    id: '1',
    tag: 'Software / Simulation',
    title: 'CREOsim-MECHA',
    description: 'A dynamic mechatronics simulation tool designed to test mechanical workflows and digital integrations prior to physical hardware construction. Engineered a custom Dijkstra pathfinding algorithm to intelligently route simulated cables through physical board gutters.',
    skills: ['Konva.js', 'TypeScript', 'Algorithms'],
    githubUrl: 'https://github.com',
    demoUrl: '',
    photos: []
  },
  {
    id: '2',
    tag: 'Mobile Development',
    title: 'CRADLE App',
    description: 'A cross-platform mobile application dormitory finder built to connect students with accommodations. Engineered robust state management and seamless UI across iOS and Android.',
    skills: ['Flutter', 'Dart', 'Firebase'],
    githubUrl: 'https://github.com',
    demoUrl: '',
    photos: []
  },
  {
    id: '3',
    tag: 'Web Application',
    title: 'PING System',
    description: 'Architected a robust OOP backend system and responsive frontend for real-time monitoring. Resolved deep architectural challenges in state management, repository patterns, and concurrent data synchronization.',
    skills: ['React', 'Node.js', 'WebSockets', 'Supabase'],
    githubUrl: 'https://github.com',
    demoUrl: '',
    photos: []
  }
];

export default function ProjectsShowcase({ isAdmin = false }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [viewMode, setViewMode] = useState('galaxy'); // 'galaxy' | 'bento'
  
  // Gallery slider state per project: { [projectId]: currentSlideIndex }
  const [activeSlide, setActiveSlide] = useState({});
  const [uploading, setUploading] = useState({});
  
  // Admin inline-edit states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [editingUrl, setEditingUrl] = useState(null); // 'github' | 'demo' | null
  const [urlDraft, setUrlDraft] = useState('');

  // Fetch projects from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'projects'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (isMounted) {
            setProjects(list);
            setActiveProjectId(list[0]?.id || null);
          }
        } else {
          if (isMounted) {
            setProjects(FALLBACK_PROJECTS);
            setActiveProjectId(FALLBACK_PROJECTS[0].id);
          }
        }
      } catch (err) {
        console.warn('Firestore fetch projects fallback:', err);
        if (isMounted) {
          setProjects(FALLBACK_PROJECTS);
          setActiveProjectId(FALLBACK_PROJECTS[0].id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  // Format projects into 3D gallery cards
  const galleryCards = useMemo(() => {
    return projects.map((p, idx) => {
      const fallbackImage = DEFAULT_PROJECT_IMAGES[idx % DEFAULT_PROJECT_IMAGES.length];
      const imageUrl = (p.photos && p.photos.length > 0) ? p.photos[0] : fallbackImage;
      return {
        id: p.id,
        title: p.title,
        tag: p.tag,
        description: p.description,
        skills: p.skills,
        imageUrl: imageUrl,
        alt: p.title,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        rawProject: p,
      };
    });
  }, [projects]);

  // Currently active project object
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Project index formatted (01, 02, etc.)
  const activeIndexNumber = useMemo(() => {
    if (!activeProject) return '01';
    const idx = projects.findIndex(p => p.id === activeProject.id);
    return idx >= 0 ? String(idx + 1).padStart(2, '0') : '01';
  }, [projects, activeProject]);

  // ─── Admin Handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = async () => {
    const newProject = {
      title: 'New Project',
      tag: 'Project',
      description: 'Click any field to edit.',
      skills: ['React', 'TypeScript'],
      githubUrl: '',
      demoUrl: '',
      photos: [],
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const created = { id: docRef.id, ...newProject };
      setProjects(prev => [...prev, created]);
      setActiveProjectId(docRef.id);
    } catch (err) {
      console.warn('Add project local fallback:', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newProject };
      setProjects(prev => [...prev, created]);
      setActiveProjectId(localId);
    }
  };

  // Update a single field on the active project (in state + Firestore)
  const handleUpdateField = async (field, value) => {
    if (!activeProject) return;
    // Optimistic state update
    setProjects(prev => prev.map(p =>
      p.id === activeProject.id ? { ...p, [field]: value } : p
    ));
    // Persist to Firestore
    try {
      await updateDoc(doc(db, 'projects', activeProject.id), { [field]: value });
    } catch (err) {
      console.warn('Field update fallback (local only):', err);
    }
  };

  // Skills management
  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (!trimmed || !activeProject) return;
    const current = activeProject.skills || [];
    if (!current.includes(trimmed)) {
      handleUpdateField('skills', [...current, trimmed]);
    }
    setNewSkillText('');
    setAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!activeProject) return;
    const updated = (activeProject.skills || []).filter(s => s !== skillToRemove);
    handleUpdateField('skills', updated);
  };

  // URL inline editing
  const handleSaveUrl = (field) => {
    handleUpdateField(field, urlDraft.trim());
    setEditingUrl(null);
    setUrlDraft('');
  };

  const handleDeleteProject = async (id, e) => {
    e?.stopPropagation?.();
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.warn('Delete project local fallback:', err);
    }
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(filtered[0]?.id || null);
      }
      return filtered;
    });
    setDeleteConfirmId(null);
  };

  const handleUploadPhoto = async (projectId, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [projectId]: true }));
    try {
      if (['1', '2', '3'].includes(projectId)) {
        const fp = FALLBACK_PROJECTS.find(p => p.id === projectId);
        if (fp) {
          const { id, ...data } = fp;
          await setDoc(doc(db, 'projects', projectId), data, { merge: true });
        }
      }

      const storageRef = ref(storage, `projects/${projectId}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'projects', projectId), {
        photos: arrayUnion(downloadUrl)
      });

      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const updatedPhotos = [...(p.photos || []), downloadUrl];
          return { ...p, photos: updatedPhotos };
        }
        return p;
      }));

      const currentProj = projects.find(p => p.id === projectId);
      const newIndex = (currentProj?.photos?.length || 0);
      setActiveSlide(prev => ({ ...prev, [projectId]: newIndex }));
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Photo upload failed. Check Firebase storage configuration.');
    } finally {
      setUploading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleRemovePhoto = async (projectId, photoUrl) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        photos: arrayRemove(photoUrl)
      });
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const updated = (p.photos || []).filter(u => u !== photoUrl);
          return { ...p, photos: updated };
        }
        return p;
      }));
      setActiveSlide(prev => ({ ...prev, [projectId]: 0 }));
    } catch (err) {
      console.error('Error removing photo:', err);
    }
  };

  const handlePushDefaults = async () => {
    if (!window.confirm('Push default showcase projects to Firebase database?')) return;
    try {
      for (const fp of FALLBACK_PROJECTS) {
        const { id, ...data } = fp;
        await setDoc(doc(db, 'projects', id), { ...data, photos: [] });
      }
      alert('Projects successfully saved to Firestore!');
    } catch (err) {
      console.error('Push defaults error:', err);
      alert('Error pushing defaults to database.');
    }
  };

  const handleCardAction = (card, actionType) => {
    setActiveProjectId(card.id);
    if (actionType === 'download' || actionType === 'edit') {
      setViewMode('bento');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* ─── Top Control Bar & Mode Switcher ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Selected Work
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
            {String(projects.length).padStart(2, '0')} Systems
          </span>
        </div>

        {/* View Mode Switcher + Admin Add Project */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode('galaxy')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'galaxy'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3D Orbit View"
            >
              <Orbit size={13} />
              <span>3D Galaxy</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bento')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'bento'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bento Inspector View"
            >
              <LayoutGrid size={13} />
              <span>Bento Grid</span>
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors cursor-pointer"
              title="Add new project"
            >
              <Plus size={13} /> Add System
            </button>
          )}
        </div>
      </div>

      {/* ─── Main View Container ─── */}
      <AnimatePresence mode="wait">
        {viewMode === 'galaxy' ? (
          /* ─────────────────────────────────────────────────────────────
              3D STELLAR GALAXY VIEW
             ───────────────────────────────────────────────────────────── */
          <motion.div
            key="galaxy-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full relative h-[480px] lg:h-[510px] rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <StellarCardGallerySingle
              cards={galleryCards}
              onCardSelect={(card) => {
                if (card) setActiveProjectId(card.id);
              }}
              onAction={handleCardAction}
              title="3D Stellar Constellation"
              subtitle="Drag to rotate • Scroll to zoom • Click cards to launch or inspect systems"
              hideHeader={false}
              className="h-full w-full"
            />
          </motion.div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              BENTO GRID VIEW (With Full Existing Functionalities)
             ───────────────────────────────────────────────────────────── */
          <motion.div
            key="bento-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-auto lg:h-[480px] xl:h-[510px] items-stretch"
          >
            {/* ─────────────────────────────────────────────────────────────
                LEFT COLUMN (5 Cols): Interactive Title List
               ───────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] tracking-tight">
                    Featured Archive
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    {String(projects.length).padStart(2, '0')} Total
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-4 hidden sm:block">
                  Select a project to inspect architecture & source code
                </p>
              </div>

              {/* Interactive Project Titles List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1 max-h-[220px] lg:max-h-none">
                {projects.map((project, idx) => {
                  const isSelected = activeProject?.id === project.id;
                  const numStr = String(idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={project.id}
                      onMouseEnter={() => setActiveProjectId(project.id)}
                      onClick={() => setActiveProjectId(project.id)}
                      className={`group relative rounded-xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer border flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_20px_rgba(103,232,249,0.15)] text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200 hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-xs font-mono font-bold transition-colors ${
                          isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}>
                          {numStr}
                        </span>

                        <div className="min-w-0">
                          <h4 className={`text-sm font-semibold truncate transition-colors font-['Outfit'] ${
                            isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                          }`}>
                            {project.title}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            {project.tag}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Active arrow / Admin actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              className="p-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        {isSelected && !isAdmin && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Admin Hint / Fallback Helper */}
              {isAdmin && projects.length > 0 && projects[0].id === '1' && (
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-amber-400/80 font-mono">Using default templates</span>
                  <button
                    type="button"
                    onClick={handlePushDefaults}
                    className="text-[11px] font-mono text-cyan-300 hover:underline cursor-pointer"
                  >
                    Push to DB
                  </button>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                RIGHT COLUMN (7 Cols): Project Showcase Preview Panel
               ───────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 sm:p-7 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-400/30 transition-all duration-300">
              {/* Ambient Glow */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {activeProject ? (
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col justify-between h-full space-y-4"
                  >
                    {/* Top Row: Tag, Number, and External Links */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <EditableText
                          text={activeProject.tag}
                          isAdmin={isAdmin}
                          onSave={(v) => handleUpdateField('tag', v)}
                          className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold"
                        />

                        {/* Quick Link Buttons (GitHub & Demo) */}
                        <div className="flex items-center gap-2">
                          {/* GitHub URL */}
                          {isAdmin ? (
                            editingUrl === 'github' ? (
                              <form
                                className="inline-flex items-center gap-1"
                                onSubmit={(e) => { e.preventDefault(); handleSaveUrl('githubUrl'); }}
                              >
                                <input
                                  type="url"
                                  value={urlDraft}
                                  onChange={(e) => setUrlDraft(e.target.value)}
                                  placeholder="https://github.com/..."
                                  className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-cyan-400 text-white text-xs outline-none w-44"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrl(null); setUrlDraft(''); } }}
                                />
                                <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                                <button type="button" onClick={() => { setEditingUrl(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setEditingUrl('github'); setUrlDraft(activeProject.githubUrl || ''); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/[0.05] border border-white/[0.1] border-dashed hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all cursor-pointer"
                                title="Click to edit GitHub URL"
                              >
                                <FolderGit2 size={13} />
                                <span>{activeProject.githubUrl ? 'Code' : 'Set Repo'}</span>
                                <Edit3 size={9} className="text-cyan-400/60" />
                              </button>
                            )
                          ) : activeProject.githubUrl ? (
                            <a
                              href={ensureAbsoluteUrl(activeProject.githubUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/[0.05] border border-white/[0.1] hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all cursor-pointer"
                              title="View GitHub Repository"
                            >
                              <FolderGit2 size={13} />
                              <span>Code</span>
                              <ExternalLink size={10} className="text-slate-500" />
                            </a>
                          ) : null}

                          {/* Demo URL */}
                          {isAdmin ? (
                            editingUrl === 'demo' ? (
                              <form
                                className="inline-flex items-center gap-1"
                                onSubmit={(e) => { e.preventDefault(); handleSaveUrl('demoUrl'); }}
                              >
                                <input
                                  type="url"
                                  value={urlDraft}
                                  onChange={(e) => setUrlDraft(e.target.value)}
                                  placeholder="https://..."
                                  className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-emerald-400 text-white text-xs outline-none w-44"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrl(null); setUrlDraft(''); } }}
                                />
                                <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                                <button type="button" onClick={() => { setEditingUrl(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setEditingUrl('demo'); setUrlDraft(activeProject.demoUrl || ''); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 border-dashed hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="Click to edit Demo URL"
                              >
                                <Globe size={13} />
                                <span>{activeProject.demoUrl ? 'Live Demo' : 'Set Demo'}</span>
                                <Edit3 size={9} className="text-emerald-400/60" />
                              </button>
                            )
                          ) : activeProject.demoUrl ? (
                            <a
                              href={ensureAbsoluteUrl(activeProject.demoUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              title="View Live Demo"
                            >
                              <Globe size={13} />
                              <span>Live Demo</span>
                              <ExternalLink size={10} className="text-emerald-400" />
                            </a>
                          ) : null}

                          <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                            {activeIndexNumber} / {String(projects.length).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight mb-2">
                        <EditableText
                          text={activeProject.title}
                          isAdmin={isAdmin}
                          onSave={(v) => handleUpdateField('title', v)}
                        />
                      </h3>

                      {/* Project Description */}
                      <div className="text-slate-300/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
                        <EditableText
                          text={activeProject.description}
                          isAdmin={isAdmin}
                          multiline={true}
                          onSave={(v) => handleUpdateField('description', v)}
                        />
                      </div>
                    </div>

                    {/* Media Preview Area */}
                    <div className="relative w-full h-[180px] sm:h-[200px] rounded-xl lg:rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950/60 group/media">
                      {activeProject.photos && activeProject.photos.length > 0 ? (
                        <>
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeSlide[activeProject.id] || 0}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.3 }}
                              src={activeProject.photos[activeSlide[activeProject.id] || 0]}
                              alt={`${activeProject.title} screenshot`}
                              className="w-full h-full object-cover object-center"
                            />
                          </AnimatePresence>

                          {/* Multi-photo Carousel Controls */}
                          {activeProject.photos.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSlide(prev => {
                                    const current = prev[activeProject.id] || 0;
                                    return {
                                      ...prev,
                                      [activeProject.id]: (current - 1 + activeProject.photos.length) % activeProject.photos.length
                                    };
                                  });
                                }}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center hover:bg-cyan-500/40 transition-colors cursor-pointer backdrop-blur-md z-10"
                              >
                                <ChevronLeft size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSlide(prev => {
                                    const current = prev[activeProject.id] || 0;
                                    return {
                                      ...prev,
                                      [activeProject.id]: (current + 1) % activeProject.photos.length
                                    };
                                  });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center hover:bg-cyan-500/40 transition-colors cursor-pointer backdrop-blur-md z-10"
                              >
                                <ChevronRight size={16} />
                              </button>

                              {/* Dots Indicator */}
                              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10">
                                {activeProject.photos.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveSlide(prev => ({ ...prev, [activeProject.id]: i }))}
                                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                                      (activeSlide[activeProject.id] || 0) === i
                                        ? 'bg-cyan-400 w-4'
                                        : 'bg-white/40 hover:bg-white/70'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {/* Admin Photo Controls */}
                          {isAdmin && (
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
                                  disabled={uploading[activeProject.id]}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleUploadPhoto(activeProject.id, e.target.files[0]);
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  const currentUrl = activeProject.photos[activeSlide[activeProject.id] || 0];
                                  if (currentUrl) handleRemovePhoto(activeProject.id, currentUrl);
                                }}
                                className="p-1.5 rounded-lg bg-slate-950/80 border border-red-500/30 text-red-400 hover:bg-red-500/30 cursor-pointer backdrop-blur-md transition-colors"
                                title="Delete current screenshot"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Placeholder graphic when no photos exist */
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-cyan-400/50 mb-2">
                            <ImageIcon size={22} />
                          </div>
                          <span className="text-xs font-mono tracking-wider text-slate-400">
                            {activeProject.title} Interface Simulation
                          </span>

                          {isAdmin && (
                            <label className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5">
                              <Plus size={13} />
                              <span>{uploading[activeProject.id] ? 'Uploading...' : 'Add Screenshot'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading[activeProject.id]}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleUploadPhoto(activeProject.id, e.target.files[0]);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )}

                      {/* Uploading Overlay */}
                      {uploading[activeProject.id] && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-cyan-300 text-xs font-mono z-30">
                          Uploading Screenshot...
                        </div>
                      )}
                    </div>

                    {/* Skills Tags List */}
                    <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(activeProject.skills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08] inline-flex items-center gap-1.5 transition-colors ${
                              isAdmin ? 'hover:border-red-400/40 hover:bg-red-500/5' : ''
                            }`}
                          >
                            {skill}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all cursor-pointer flex-shrink-0"
                                title={`Remove ${skill}`}
                              >
                                <X size={8} />
                              </button>
                            )}
                          </span>
                        ))}

                        {/* Admin: Add skill button / inline input */}
                        {isAdmin && !addingSkill && (
                          <button
                            type="button"
                            onClick={() => { setAddingSkill(true); setNewSkillText(''); }}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 border-dashed inline-flex items-center gap-1 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                          >
                            <Plus size={10} /> Add Skill
                          </button>
                        )}

                        {isAdmin && addingSkill && (
                          <form
                            className="inline-flex items-center gap-1"
                            onSubmit={(e) => { e.preventDefault(); handleAddSkill(); }}
                          >
                            <input
                              type="text"
                              value={newSkillText}
                              onChange={(e) => setNewSkillText(e.target.value)}
                              placeholder="Skill name"
                              className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-cyan-400 text-white text-[11px] font-mono outline-none w-24"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Escape') { setAddingSkill(false); setNewSkillText(''); } }}
                            />
                            <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={11} /></button>
                            <button type="button" onClick={() => { setAddingSkill(false); setNewSkillText(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={11} /></button>
                          </form>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">
                    No project selected.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
