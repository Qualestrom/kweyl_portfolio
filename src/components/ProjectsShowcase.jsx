import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
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
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import EditableText from './EditableText';
import ImageWithPlaceholder from './ImageWithPlaceholder';

const DEFAULT_PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', // Mecha / simulation
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', // Mobile / app
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Analytics / web
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Abstract 3D
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Matrix code
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // Modern workspace
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Silicon hardware
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Orbital node
];

const FALLBACK_PROJECTS = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    category: 'Full Stack Web App',
    description: 'Modern full-stack online shopping experience built with Next.js, Stripe checkout integration, and real-time inventory management.',
    skills: ['Next.js', 'TypeScript', 'Tailwind', 'Stripe', 'PostgreSQL'],
    demoUrl: 'https://demo-ecommerce.example.com',
    githubUrl: 'https://github.com/example/ecommerce',
    photos: []
  },
  {
    id: '2',
    title: 'AI Analytics Dashboard',
    category: 'Data & Visualization',
    description: 'Interactive analytics cockpit with predictive metrics, dynamic data charts, real-time telemetry, and exportable business reports.',
    skills: ['React', 'D3.js', 'Python', 'FastAPI', 'Tailwind'],
    demoUrl: 'https://demo-analytics.example.com',
    githubUrl: 'https://github.com/example/ai-dashboard',
    photos: []
  },
  {
    id: '3',
    title: 'Health & Fitness Tracker',
    category: 'Cross-Platform Mobile',
    description: 'Comprehensive cross-platform wellness application featuring real-time biometric synchronization, workout planner, and nutritional logging.',
    skills: ['Flutter', 'Dart', 'Firebase', 'HealthKit', 'Bloc'],
    demoUrl: 'https://demo-fitness.example.com',
    githubUrl: 'https://github.com/example/fitness-tracker',
    photos: []
  },
  {
    id: '4',
    title: 'Task & Workspace Flow',
    category: 'Productivity Tool',
    description: 'Collaborative task and sprint tracking board with real-time websocket synchronization, rich markdown editing, and workflow automation.',
    skills: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Redis'],
    demoUrl: 'https://demo-taskflow.example.com',
    githubUrl: 'https://github.com/example/taskflow',
    photos: []
  },
  {
    id: '5',
    title: 'Cloud DevOps Pipeline',
    category: 'Cloud & Infrastructure',
    description: 'Automated multi-environment continuous integration and deployment pipeline configured with infrastructure-as-code and container orchestration.',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GitHub Actions'],
    demoUrl: '',
    githubUrl: 'https://github.com/example/devops-pipeline',
    photos: []
  }
];

const COLLAPSED_WIDTH_PX = 48;
const FULL_WIDTH_PX = 160;
const GAP_PX = 6;
const MARGIN_PX = 2;

export default function ProjectsShowcase({ isAdmin = false }) {
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_projects');
      return cached ? JSON.parse(cached) : FALLBACK_PROJECTS;
    } catch (_) {
      return FALLBACK_PROJECTS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState({});

  // Admin inline-edit states
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [editingUrl, setEditingUrl] = useState(null); // 'github' | 'demo' | null
  const [urlDraft, setUrlDraft] = useState('');

  const containerRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const x = useMotionValue(0);

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
            try {
              localStorage.setItem('portfolio_projects', JSON.stringify(list));
            } catch (_) {}
            setIndex(0);
          }
        } else {
          if (isMounted) {
            setProjects(FALLBACK_PROJECTS);
            setIndex(0);
          }
        }
      } catch (err) {
        console.warn('Firestore fetch projects fallback:', err);
        if (isMounted) {
          setProjects(FALLBACK_PROJECTS);
          setIndex(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  // Currently active project
  const activeProject = useMemo(() => {
    return projects[index] || projects[0] || null;
  }, [projects, index]);

  // Project index string (01, 02, etc.)
  const activeIndexNumber = useMemo(() => {
    return String(index + 1).padStart(2, '0');
  }, [index]);

  // Main Carousel Animation
  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, isDragging]);

  // Thumbnail Auto-scroll to center active item
  useEffect(() => {
    if (thumbnailsRef.current) {
      let scrollPosition = 0;
      for (let i = 0; i < index; i++) {
        scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
      }
      scrollPosition += MARGIN_PX;

      const containerWidth = thumbnailsRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
      scrollPosition -= centerOffset;

      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [index]);

  // Helper to get image for a project
  const getProjectImage = (p, idx) => {
    if (p.photos && p.photos.length > 0) return p.photos[0];
    return DEFAULT_PROJECT_IMAGES[idx % DEFAULT_PROJECT_IMAGES.length];
  };

  // ─── Admin Handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = async () => {
    const newProject = {
      title: 'New Project',
      tag: 'Project',
      description: 'Click any field to edit this project.',
      skills: ['React', 'TypeScript'],
      githubUrl: '',
      demoUrl: '',
      photos: [],
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const created = { id: docRef.id, ...newProject };
      setProjects(prev => {
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
    } catch (err) {
      console.warn('Add project local fallback:', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newProject };
      setProjects(prev => {
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
    }
  };

  const handleUpdateField = async (field, value) => {
    if (!activeProject) return;
    setProjects(prev => prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
    try {
      await updateDoc(doc(db, 'projects', activeProject.id), { [field]: value });
    } catch (err) {
      console.warn('Field update fallback (local only):', err);
    }
  };

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

  const handleSaveUrl = (field) => {
    handleUpdateField(field, urlDraft.trim());
    setEditingUrl(null);
    setUrlDraft('');
  };

  const handleDeleteProject = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.warn('Delete project local fallback:', err);
    }
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      setIndex(prevIndex => Math.max(0, Math.min(filtered.length - 1, prevIndex)));
      return filtered;
    });
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
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Photo upload failed. Check Firebase storage configuration.');
    } finally {
      setUploading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleRemovePhoto = async (projectId, photoUrl, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this photo?')) return;
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

  // Main slide click handler -> redirect to demoUrl or githubUrl
  const handleSlideClick = (project) => {
    if (isDragging) return;
    const targetUrl = project.demoUrl || project.githubUrl;
    if (targetUrl) {
      window.open(ensureAbsoluteUrl(targetUrl), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      {/* ─── Top Header / Controls (Left-Aligned Cluster to avoid Logout/Theme collisions) ─── */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Selected Work
          </div>
          <span className="text-xs font-mono text-slate-300 bg-white/[0.05] border border-white/[0.1] px-2.5 py-0.5 rounded-full font-medium">
            {activeIndexNumber} / {String(projects.length).padStart(2, '0')}
          </span>

          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors cursor-pointer shadow-md"
                title="Add new project"
              >
                <Plus size={13} /> Add Project
              </button>

              {activeProject && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteProject(activeProject.id, e)}
                  className="p-1 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer shadow-md"
                  title="Delete current project"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Carousel Display ─── */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.1] bg-slate-950/80 shadow-[0_12px_40px_rgba(0,0,0,0.5)]" ref={containerRef}>
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          drag="x"
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            const containerWidth = containerRef.current?.offsetWidth || 1;
            const offset = info.offset.x;
            const velocity = info.velocity.x;

            let newIndex = index;
            if (Math.abs(velocity) > 500) {
              newIndex = velocity > 0 ? index - 1 : index + 1;
            } else if (Math.abs(offset) > containerWidth * 0.25) {
              newIndex = offset > 0 ? index - 1 : index + 1;
            }

            newIndex = Math.max(0, Math.min(projects.length - 1, newIndex));
            setIndex(newIndex);
          }}
          style={{ x }}
        >
          {projects.map((project, idx) => {
            const imageUrl = getProjectImage(project, idx);
            const isCurrent = idx === index;
            const hasLink = Boolean(project.demoUrl || project.githubUrl);

            return (
              <div 
                key={project.id || idx} 
                className="shrink-0 w-full h-[380px] sm:h-[430px] lg:h-[470px] relative overflow-hidden group select-none"
              >
                {/* Background Project Image with Stellar Shimmer Placeholder */}
                <ImageWithPlaceholder
                  src={imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                  containerClassName="absolute inset-0"
                  showSpinner={true}
                  draggable={false}
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none z-10" />

                {/* Admin Photo Management Controls (top left inside frame) */}
                {isAdmin && isCurrent && (
                  <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2">
                    <label
                      title="Upload new photo for this project"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                    >
                      <Plus size={13} />
                      <span>{uploading[project.id] ? 'Uploading...' : 'Add Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading[project.id]}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadPhoto(project.id, e.target.files[0]);
                        }}
                      />
                    </label>

                    {project.photos && project.photos.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(project.id, project.photos[0], e)}
                        className="p-1.5 rounded-xl bg-slate-950/90 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                        title="Delete project photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Click to redirect indicator hint (top right inside frame) */}
                {hasLink && !isAdmin && (
                  <div 
                    onClick={() => handleSlideClick(project)}
                    className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-xs font-mono opacity-80 group-hover:opacity-100 group-hover:bg-cyan-500/20 cursor-pointer transition-all shadow-lg"
                    title="Click photo to visit project link"
                  >
                    <span>Visit Project</span>
                    <ExternalLink size={12} />
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    PROJECT DETAILS OVERLAY (Lower-Left of the Highlighted Photo)
                   ───────────────────────────────────────────────────────────── */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-20 flex flex-col justify-end max-w-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Project Tag */}
                  <div className="mb-1.5">
                    <EditableText
                      text={project.tag}
                      isAdmin={isAdmin}
                      onSave={(v) => handleUpdateField('tag', v)}
                      className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold drop-shadow-sm"
                    />
                  </div>

                  {/* Project Title — Clickable to redirect */}
                  <h3 
                    onClick={() => {
                      if (!isAdmin) handleSlideClick(project);
                    }}
                    className={`text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight mb-2 flex items-center gap-2 ${
                      hasLink && !isAdmin ? 'cursor-pointer hover:text-cyan-300 transition-colors' : ''
                    }`}
                  >
                    <EditableText
                      text={project.title}
                      isAdmin={isAdmin}
                      onSave={(v) => handleUpdateField('title', v)}
                    />
                    {hasLink && !isAdmin && (
                      <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 text-cyan-400 inline shrink-0" />
                    )}
                  </h3>

                  {/* Project Description */}
                  <div className="text-slate-200/90 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 sm:line-clamp-4 max-w-xl drop-shadow-sm">
                    <EditableText
                      text={project.description}
                      isAdmin={isAdmin}
                      multiline={true}
                      onSave={(v) => handleUpdateField('description', v)}
                    />
                  </div>

                  {/* Skills Tags List */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {(project.skills || []).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.08] text-cyan-200 border border-white/[0.12] backdrop-blur-md inline-flex items-center gap-1.5 shadow-sm"
                      >
                        {skill}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X size={8} />
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Admin: Add skill inline */}
                    {isAdmin && !addingSkill && (
                      <button
                        type="button"
                        onClick={() => { setAddingSkill(true); setNewSkillText(''); }}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 border-dashed inline-flex items-center gap-1 hover:bg-cyan-500/30 transition-colors cursor-pointer backdrop-blur-md"
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
                          className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-cyan-400 text-white text-[11px] font-mono outline-none w-24 backdrop-blur-md"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Escape') { setAddingSkill(false); setNewSkillText(''); } }}
                        />
                        <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={11} /></button>
                        <button type="button" onClick={() => { setAddingSkill(false); setNewSkillText(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={11} /></button>
                      </form>
                    )}
                  </div>

                  {/* Action Link Pills: Live Demo & GitHub Code */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Demo URL */}
                    {isAdmin ? (
                      editingUrl === 'demo' ? (
                        <form
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-emerald-400"
                          onSubmit={(e) => { e.preventDefault(); handleSaveUrl('demoUrl'); }}
                        >
                          <input
                            type="url"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            placeholder="https://..."
                            className="px-2 py-0.5 rounded bg-transparent text-white text-xs outline-none w-48 font-mono"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrl(null); setUrlDraft(''); } }}
                          />
                          <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                          <button type="button" onClick={() => { setEditingUrl(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingUrl('demo'); setUrlDraft(project.demoUrl || ''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 border-dashed hover:bg-emerald-500/30 transition-all cursor-pointer backdrop-blur-md"
                          title="Click to edit Demo URL"
                        >
                          <Globe size={13} />
                          <span>{project.demoUrl ? 'Live Demo' : 'Set Demo URL'}</span>
                          <Edit3 size={10} className="text-emerald-400/70" />
                        </button>
                      )
                    ) : project.demoUrl ? (
                      <a
                        href={ensureAbsoluteUrl(project.demoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                        title="Open Live Demo"
                      >
                        <Globe size={13} />
                        <span>Live Demo</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : null}

                    {/* GitHub Code URL */}
                    {isAdmin ? (
                      editingUrl === 'github' ? (
                        <form
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-cyan-400"
                          onSubmit={(e) => { e.preventDefault(); handleSaveUrl('githubUrl'); }}
                        >
                          <input
                            type="url"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            placeholder="https://github.com/..."
                            className="px-2 py-0.5 rounded bg-transparent text-white text-xs outline-none w-48 font-mono"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrl(null); setUrlDraft(''); } }}
                          />
                          <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                          <button type="button" onClick={() => { setEditingUrl(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingUrl('github'); setUrlDraft(project.githubUrl || ''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 border-dashed hover:bg-cyan-500/30 transition-all cursor-pointer backdrop-blur-md"
                          title="Click to edit GitHub URL"
                        >
                          <FolderGit2 size={13} />
                          <span>{project.githubUrl ? 'Source Code' : 'Set Repo URL'}</span>
                          <Edit3 size={10} className="text-cyan-400/70" />
                        </button>
                      )
                    ) : project.githubUrl ? (
                      <a
                        href={ensureAbsoluteUrl(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-200 bg-white/[0.08] border border-white/[0.15] hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-md"
                        title="View Source Code"
                      >
                        <FolderGit2 size={13} />
                        <span>Source Code</span>
                        <ExternalLink size={10} className="text-slate-400" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ─── Navigation Arrow Buttons ─── */}
        <motion.button
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 ${
            index === 0
              ? 'opacity-20 cursor-not-allowed bg-black/40 text-slate-500 border border-white/5'
              : 'bg-slate-950/70 text-white border border-white/20 hover:bg-cyan-500/30 hover:border-cyan-400/50 shadow-lg hover:scale-105 active:scale-95'
          }`}
          title="Previous Project"
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button
          disabled={index === projects.length - 1}
          onClick={() => setIndex((i) => Math.min(projects.length - 1, i + 1))}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 ${
            index === projects.length - 1
              ? 'opacity-20 cursor-not-allowed bg-black/40 text-slate-500 border border-white/5'
              : 'bg-slate-950/70 text-white border border-white/20 hover:bg-cyan-500/30 hover:border-cyan-400/50 shadow-lg hover:scale-105 active:scale-95'
          }`}
          title="Next Project"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* ─── Bottom Thumbnail Strip ─── */}
      <div
        ref={thumbnailsRef}
        className="overflow-x-auto mt-3 py-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex items-center gap-1.5 h-16 sm:h-20" style={{ width: 'fit-content' }}>
          {projects.map((project, i) => {
            const thumbUrl = getProjectImage(project, i);
            const isCurrent = i === index;

            return (
              <motion.button
                key={project.id || i}
                onClick={() => setIndex(i)}
                initial={false}
                animate={isCurrent ? 'active' : 'inactive'}
                variants={{
                  active: {
                    width: FULL_WIDTH_PX,
                    marginLeft: MARGIN_PX,
                    marginRight: MARGIN_PX,
                  },
                  inactive: {
                    width: COLLAPSED_WIDTH_PX,
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`relative shrink-0 h-full overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.4)] opacity-100 ring-1 ring-cyan-400/50'
                    : 'border-white/10 opacity-50 hover:opacity-80 hover:border-white/30'
                }`}
                title={project.title}
              >
                <ImageWithPlaceholder
                  src={thumbUrl}
                  alt={project.title}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  containerClassName="w-full h-full"
                  draggable={false}
                />
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5 z-10">
                    <span className="text-[10px] font-semibold text-white font-['Outfit'] truncate">
                      {project.title}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Navigation Legend Bar ─── */}
      <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] font-mono text-slate-400/90 text-center flex-wrap px-2">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[10px] text-slate-300">◄</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[10px] text-slate-300">►</kbd>
          <span>Drag or arrows to explore projects</span>
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          <span>Click thumbnail to view details</span>
        </span>
      </div>

      {/* Admin Seed Helper if only fallback projects */}
      {isAdmin && projects.length > 0 && projects[0].id === '1' && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-amber-400/80">Using fallback templates</span>
          <button
            type="button"
            onClick={handlePushDefaults}
            className="text-cyan-300 hover:underline cursor-pointer"
          >
            Push to Firestore DB
          </button>
        </div>
      )}
    </div>
  );
}
