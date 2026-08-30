import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
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
  Images,
  Check, 
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import { isGitHubRepoUrl, fetchGitHubRepoMetadata } from '../utils/githubUtils';
import EditableText from './EditableText';
import ImageWithPlaceholder from './ImageWithPlaceholder';

// Status badge configurations for projects (Deployed, In Progress, Confidential)
const PROJECT_STATUS_CONFIG = {
  'deployed': {
    label: 'Deployed',
    colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    dotClass: 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    icon: Globe,
  },
  'in-progress': {
    label: 'In Progress',
    colorClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    dotClass: 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    icon: Sparkles,
  },
  'confidential': {
    label: 'Confidential',
    colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    icon: Lock,
  }
};

const getEffectiveStatus = (project) => {
  if (project?.status && PROJECT_STATUS_CONFIG[project.status]) {
    return project.status;
  }
  if (project?.demoUrl) return 'deployed';
  if (project?.githubUrl) return 'in-progress';
  return 'confidential';
};

// Multi-Image Gallery & Slideshow Component with Smooth Crossfade Transitions
const ProjectMediaSlider = ({
  photos = [],
  fallbackImage = null,
  title = '',
  isCurrentSlide = false,
  isAdmin = false,
  projectId = '',
  uploadingStatus = false,
  onUploadPhotos,
  onRemovePhoto,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // If photos array changes or gets smaller, clamp index safely
  useEffect(() => {
    if (photos.length > 0 && photoIndex >= photos.length) {
      setPhotoIndex(photos.length - 1);
    }
  }, [photos.length, photoIndex]);

  // Automatic slideshow transition when there are multiple photos (every 4.5s, pauses on hover)
  useEffect(() => {
    if (!isCurrentSlide || photos.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isCurrentSlide, photos.length, isHovered]);

  const hasPhotos = photos && photos.length > 0;
  const currentImageUrl = hasPhotos ? photos[photoIndex] : fallbackImage;
  const totalPhotos = photos.length;

  const handleNextPhoto = (e) => {
    e?.stopPropagation?.();
    if (totalPhotos > 1) {
      setPhotoIndex((prev) => (prev + 1) % totalPhotos);
    }
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation?.();
    if (totalPhotos > 1) {
      setPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Smooth Crossfade */}
      <AnimatePresence mode="wait">
        {currentImageUrl ? (
          <motion.div
            key={`${projectId}-img-${photoIndex}-${currentImageUrl}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <ImageWithPlaceholder
              src={currentImageUrl}
              alt={title || 'Project Preview'}
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
              containerClassName="w-full h-full"
              showSpinner={true}
              draggable={false}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(2,132,199,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.12),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-3 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-cyan-500/10 border border-sky-500/30 dark:border-cyan-400/30 flex items-center justify-center text-sky-400 dark:text-cyan-300 shadow-[0_0_24px_rgba(2,132,199,0.2)]">
                <ImageIcon size={28} />
              </div>
              <span className="text-sm font-bold text-white font-['Outfit'] tracking-wide">
                {title || 'Blank Project'}
              </span>
              <span className="text-xs font-mono text-slate-400 tracking-wide">
                {isAdmin ? 'Upload project screenshots using "Add Photos"' : 'Project preview coming soon'}
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Multiple Photos Controls (Mini Navigation Arrows on Hover & Dots Counter) */}
      {totalPhotos > 1 && (
        <>
          {/* Left / Right mini navigation buttons */}
          <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              title="Previous Photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              title="Next Photo"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Photo Dots & Counter Badge */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-md pointer-events-auto select-none">
            <Images size={12} className="text-cyan-400" />
            <div className="flex items-center gap-1">
              {photos.map((_, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(pIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    pIdx === photoIndex
                      ? 'w-4 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`View photo ${pIdx + 1} of ${totalPhotos}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-300 font-bold ml-1">
              {photoIndex + 1}/{totalPhotos}
            </span>
          </div>
        </>
      )}

      {/* Admin Photo Management Controls (Top Left) */}
      {isAdmin && isCurrentSlide && (
        <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <label
            title="Upload photo(s) for this project (select one or multiple)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer backdrop-blur-md transition-colors shadow-lg"
          >
            <Plus size={13} />
            <span>{uploadingStatus ? 'Uploading...' : totalPhotos > 0 ? 'Add Photos' : 'Add Photo'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={Boolean(uploadingStatus)}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onUploadPhotos(projectId, e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </label>

          {hasPhotos && (
            <button
              type="button"
              onClick={(e) => onRemovePhoto(projectId, photos[photoIndex], e)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
              title={`Delete current photo (${photoIndex + 1} of ${totalPhotos})`}
            >
              <Trash2 size={12} />
              <span className="text-[11px] font-mono">{totalPhotos > 1 ? `Delete (${photoIndex + 1}/${totalPhotos})` : 'Delete'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
    status: 'deployed',
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
    status: 'deployed',
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
    status: 'deployed',
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
    status: 'in-progress',
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
    status: 'confidential',
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

  // Admin inline-edit states (scoped safely to project ID)
  const [addingSkillId, setAddingSkillId] = useState(null); // projectId | null
  const [newSkillText, setNewSkillText] = useState('');
  const [editingUrl, setEditingUrl] = useState(null); // { projectId: string, field: 'demo' | 'github' } | null
  const [urlDraft, setUrlDraft] = useState('');

  // Add project with GitHub URL prompt state
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [addRepoUrl, setAddRepoUrl] = useState('');

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

  // Synchronize projects to localStorage whenever updated
  useEffect(() => {
    if (projects && projects.length > 0) {
      try {
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
      } catch (_) {}
    }
  }, [projects]);

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
    if (p.id && ['1', '2', '3', '4', '5'].includes(p.id)) {
      return DEFAULT_PROJECT_IMAGES[idx % DEFAULT_PROJECT_IMAGES.length];
    }
    return null;
  };

  // ─── Admin Handlers (Scoped by Project ID) ─────────────────────────────────
  
  // Create blank project without GitHub scan
  const handleCreateBlankProject = async () => {
    setShowAddPrompt(false);
    setAddRepoUrl('');
    const newProject = {
      title: 'New Project',
      tag: 'Web Application',
      description: '',
      skills: [],
      githubUrl: '',
      demoUrl: '',
      status: 'in-progress',
      photos: [],
      isInferred: false,
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

  // Scan GitHub repository and auto-create project (Always Overwrite)
  const handleScanAndCreateProject = async (e) => {
    e?.preventDefault?.();
    const url = addRepoUrl.trim();
    if (!url) {
      handleCreateBlankProject();
      return;
    }

    if (!isGitHubRepoUrl(url)) {
      alert('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo) or choose "Blank".');
      return;
    }

    setShowAddPrompt(false);
    setAddRepoUrl('');

    // 1. Create initial project doc to immediately show the slide & scanning spinner
    const initialProject = {
      title: 'Scanning Repository...',
      tag: 'Scanning...',
      description: '',
      skills: [],
      githubUrl: url,
      demoUrl: '',
      status: 'in-progress',
      photos: [],
      isInferred: false,
      createdAt: new Date().toISOString(),
    };

    let createdId;
    try {
      const docRef = await addDoc(collection(db, 'projects'), initialProject);
      createdId = docRef.id;
    } catch (err) {
      console.warn('Add project initial doc fallback:', err);
      createdId = `local-${Date.now()}`;
    }

    const created = { id: createdId, ...initialProject };
    setProjects(prev => {
      const next = [...prev, created];
      setIndex(next.length - 1);
      return next;
    });

    // 2. Begin multi-tier scan
    setUploading(prev => ({ ...prev, [createdId]: 'Connecting to GitHub...' }));

    try {
      const metadata = await fetchGitHubRepoMetadata(url, (status) => {
        setUploading(prev => ({ ...prev, [createdId]: status }));
      });

      const updatedPayload = {
        title: metadata.title || 'Untitled Project',
        tag: metadata.tag || 'Software Project',
        description: metadata.description || '',
        skills: metadata.skills || [],
        githubUrl: metadata.githubUrl || url,
        demoUrl: metadata.demoUrl || '',
        status: metadata.status || (metadata.demoUrl ? 'deployed' : 'in-progress'),
        isInferred: Boolean(metadata.isInferred),
      };

      try {
        await updateDoc(doc(db, 'projects', createdId), updatedPayload);
      } catch (dbErr) {
        console.warn('Update doc fallback (local only):', dbErr);
      }

      setProjects(prev => prev.map(p =>
        p.id === createdId ? { ...p, ...updatedPayload } : p
      ));
    } catch (scanErr) {
      console.error('Scan GitHub metadata failed:', scanErr);
      alert('GitHub Scan Notice: ' + (scanErr.message || 'Could not auto-fetch repo details.') + '\nYou can still fill details manually.');
      const fallbackPayload = {
        title: 'New Project',
        tag: 'Web Project',
        githubUrl: url,
        status: 'in-progress',
      };
      try {
        await updateDoc(doc(db, 'projects', createdId), fallbackPayload);
      } catch (_) {}
      setProjects(prev => prev.map(p =>
        p.id === createdId ? { ...p, ...fallbackPayload } : p
      ));
    } finally {
      setUploading(prev => ({ ...prev, [createdId]: false }));
    }
  };

  const handleCycleStatus = async (projectId, currentStatus, e) => {
    e?.stopPropagation?.();
    const statusOrder = ['deployed', 'in-progress', 'confidential'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: nextStatus } : p
    ));
    try {
      await updateDoc(doc(db, 'projects', projectId), { status: nextStatus });
    } catch (err) {
      console.warn('Status update fallback (local only):', err);
    }
  };

  const handleUpdateField = async (projectId, field, value) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, [field]: value } : p
    ));
    try {
      await updateDoc(doc(db, 'projects', projectId), { [field]: value });
    } catch (err) {
      console.warn('Field update fallback (local only):', err);
    }
  };

  const handleAddSkill = (projectId) => {
    const trimmed = newSkillText.trim();
    if (!trimmed) return;
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return;
    const current = targetProject.skills || [];
    if (!current.includes(trimmed)) {
      handleUpdateField(projectId, 'skills', [...current, trimmed]);
    }
    setNewSkillText('');
    setAddingSkillId(null);
  };

  const handleRemoveSkill = (projectId, skillToRemove) => {
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return;
    const updated = (targetProject.skills || []).filter(s => s !== skillToRemove);
    handleUpdateField(projectId, 'skills', updated);
  };

  const handleSaveUrl = async (projectId, field) => {
    const rawVal = urlDraft.trim();
    setEditingUrl(null);
    setUrlDraft('');

    // If setting/editing GitHub URL, trigger auto-scan & overwrite all details
    if (field === 'githubUrl' && isGitHubRepoUrl(rawVal)) {
      handleUpdateField(projectId, 'githubUrl', rawVal);

      setUploading(prev => ({ ...prev, [projectId]: 'Connecting to GitHub...' }));
      try {
        const metadata = await fetchGitHubRepoMetadata(rawVal, (status) => {
          setUploading(prev => ({ ...prev, [projectId]: status }));
        });

        const overwritePayload = {
          title: metadata.title || 'Untitled Project',
          tag: metadata.tag || 'Software Project',
          description: metadata.description || '',
          skills: metadata.skills || [],
          githubUrl: metadata.githubUrl || rawVal,
          demoUrl: metadata.demoUrl || '',
          status: metadata.status || (metadata.demoUrl ? 'deployed' : 'in-progress'),
          isInferred: Boolean(metadata.isInferred),
        };

        await updateDoc(doc(db, 'projects', projectId), overwritePayload);

        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, ...overwritePayload } : p
        ));
      } catch (err) {
        console.error('Error re-scanning GitHub repo:', err);
        alert('GitHub Scan Notice: ' + (err.message || 'Could not auto-fetch repo details.'));
      } finally {
        setUploading(prev => ({ ...prev, [projectId]: false }));
      }
    } else {
      handleUpdateField(projectId, field, rawVal);
    }
  };

  const handleConfirmInferred = async (projectId, e) => {
    e?.stopPropagation?.();
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, isInferred: false } : p
    ));
    try {
      await updateDoc(doc(db, 'projects', projectId), { isInferred: false });
    } catch (err) {
      console.warn('Confirm inferred local fallback:', err);
    }
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

  const handleUploadPhotos = async (projectId, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploading(prev => ({ ...prev, [projectId]: `Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...` }));
    
    try {
      const currentProj = projects.find(p => p.id === projectId);

      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploading(prev => ({ ...prev, [projectId]: `Uploading photo ${i + 1}/${files.length}...` }));
        const storageRef = ref(storage, `projects/${projectId}/${Date.now()}-${i}-${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadUrl);
      }

      // Preserve all existing photos and append newly uploaded ones
      const currentPhotos = (currentProj && Array.isArray(currentProj.photos)) ? [...currentProj.photos] : [];
      const updatedPhotos = [...currentPhotos, ...uploadedUrls];

      // Update in Firestore without wiping any fields
      try {
        if (currentProj) {
          const { id, ...dataToSave } = currentProj;
          await setDoc(doc(db, 'projects', projectId), {
            ...dataToSave,
            photos: updatedPhotos
          }, { merge: true });
        } else {
          await updateDoc(doc(db, 'projects', projectId), {
            photos: updatedPhotos
          });
        }
      } catch (dbErr) {
        console.warn('Firestore photo update fallback:', dbErr);
      }

      // Update in React State
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, photos: updatedPhotos };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error uploading photo(s):', err);
      alert('Photo upload failed: ' + (err.message || 'Check Firebase storage configuration.'));
    } finally {
      setUploading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleRemovePhoto = async (projectId, photoUrl, e) => {
    e?.stopPropagation?.();
    if (!photoUrl) return;
    if (!window.confirm('Delete this photo from project gallery?')) return;
    try {
      const currentProj = projects.find(p => p.id === projectId);
      const updatedPhotos = (currentProj?.photos || []).filter(u => u !== photoUrl);

      try {
        await updateDoc(doc(db, 'projects', projectId), {
          photos: updatedPhotos
        });
      } catch (err) {
        console.warn('Firestore remove photo fallback:', err);
      }

      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, photos: updatedPhotos };
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
      {/* ─── Top Header / Controls (Theme-Adaptive) ─── */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-cyan-500/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-cyan-400 animate-pulse" />
            Selected Work
          </div>
          <span className="text-xs font-mono text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] px-2.5 py-0.5 rounded-full font-bold">
            {activeIndexNumber} / {String(projects.length).padStart(2, '0')}
          </span>

          {isAdmin && (
            showAddPrompt ? (
              <form 
                onSubmit={handleScanAndCreateProject}
                className="inline-flex items-center gap-1.5 p-1 px-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500 dark:border-cyan-400 shadow-xl backdrop-blur-md z-40 max-w-full flex-wrap animate-fadeIn"
              >
                <FolderGit2 size={14} className="text-sky-600 dark:text-cyan-400 shrink-0" />
                <input
                  type="url"
                  value={addRepoUrl}
                  onChange={(e) => setAddRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono outline-none w-52 sm:w-72"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowAddPrompt(false);
                      setAddRepoUrl('');
                    }
                  }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-sky-500 dark:bg-cyan-500 text-white dark:text-slate-950 hover:bg-sky-600 dark:hover:bg-cyan-400 transition-colors cursor-pointer shadow-sm"
                  title="Scan repository and auto-fill project details"
                >
                  <Sparkles size={12} />
                  <span>Scan</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateBlankProject}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Create blank project without GitHub scan"
                >
                  Blank
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPrompt(false);
                    setAddRepoUrl('');
                  }}
                  className="p-1 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setShowAddPrompt(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-sky-100 dark:bg-cyan-500/20 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-cyan-500/40 hover:bg-sky-200 dark:hover:bg-cyan-500/30 transition-colors cursor-pointer shadow-sm"
                  title="Add new project from GitHub repository"
                >
                  <Plus size={13} /> Add Project
                </button>

                {activeProject && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(activeProject.id, e)}
                    className="p-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer shadow-sm"
                    title="Delete current project"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* ─── Main Carousel Display ─── */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-slate-300/80 dark:border-white/[0.1] bg-slate-950/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]" ref={containerRef}>
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
            const isCurrent = idx === index;
            const hasLink = Boolean(project.demoUrl || project.githubUrl);

            return (
              <div 
                key={project.id || idx} 
                className="shrink-0 w-full h-[390px] sm:h-[430px] lg:h-[470px] relative overflow-hidden group select-none"
              >
                {/* Multi-Image Gallery & Crossfade Slideshow */}
                <ProjectMediaSlider
                  photos={project.photos || []}
                  fallbackImage={getProjectImage(project, idx)}
                  title={project.title || 'Project Preview'}
                  isCurrentSlide={isCurrent}
                  isAdmin={isAdmin}
                  projectId={project.id}
                  uploadingStatus={uploading[project.id]}
                  onUploadPhotos={handleUploadPhotos}
                  onRemovePhoto={handleRemovePhoto}
                />

                {/* Lightened, soft gradient overlay — keeps screenshot bright & clear while ensuring text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/10 to-transparent pointer-events-none z-10" />

                {/* Click to redirect indicator hint (top right inside frame, only if single photo or not hovering controls) */}
                {hasLink && !isAdmin && (!project.photos || project.photos.length <= 1) && (
                  <div 
                    onClick={() => handleSlideClick(project)}
                    className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-xs font-mono opacity-80 group-hover:opacity-100 group-hover:bg-cyan-500/20 cursor-pointer transition-all shadow-lg"
                    title="Click photo to visit project link"
                  >
                    <span>Visit Project</span>
                    <ExternalLink size={12} />
                  </div>
                )}

                {/* Scanning / Uploading Status Overlay */}
                {Boolean(uploading[project.id]) && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2.5 text-cyan-300 text-xs font-mono z-40 backdrop-blur-md">
                    <Sparkles size={24} className="animate-spin text-cyan-400" />
                    <span className="font-bold text-sm text-cyan-200 animate-pulse">
                      {typeof uploading[project.id] === 'string' ? uploading[project.id] : 'Processing...'}
                    </span>
                    <span className="text-[11px] text-slate-400">Updating project details & media</span>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    PROJECT DETAILS OVERLAY (Lower-Left of the Highlighted Photo)
                   ───────────────────────────────────────────────────────────── */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-8 z-20 flex flex-col justify-end max-w-3xl max-h-[85%]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Inferred Review Banner */}
                  {isAdmin && isCurrent && project.isInferred && (
                    <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono backdrop-blur-md shadow-md">
                      <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                      <span className="text-[11px] font-medium leading-tight">
                        Details auto-detected from files. Please check & confirm.
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleConfirmInferred(project.id, e)}
                        className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-bold hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
                        title="Acknowledge and mark details as confirmed"
                      >
                        <CheckCircle2 size={11} /> Confirm
                      </button>
                    </div>
                  )}

                  {/* Project Tag & Status Badge Row */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <EditableText
                      text={project.tag}
                      isAdmin={isAdmin && isCurrent}
                      placeholder="CATEGORY / TAG"
                      onSave={(v) => handleUpdateField(project.id, 'tag', v)}
                      className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold drop-shadow-sm"
                    />

                    <span className="text-slate-500 text-xs select-none">•</span>

                    {/* Project Status Badge */}
                    {(() => {
                      const statusKey = getEffectiveStatus(project);
                      const statusCfg = PROJECT_STATUS_CONFIG[statusKey] || PROJECT_STATUS_CONFIG['in-progress'];
                      const IconComp = statusCfg.icon;

                      return (
                        <button
                          type="button"
                          onClick={isAdmin && isCurrent ? (e) => handleCycleStatus(project.id, statusKey, e) : undefined}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border backdrop-blur-md transition-all select-none ${statusCfg.colorClass} ${
                            isAdmin && isCurrent ? 'cursor-pointer hover:brightness-125 hover:border-cyan-400 active:scale-95' : 'cursor-default'
                          }`}
                          title={isAdmin && isCurrent ? `Status: ${statusCfg.label} (Click to toggle: Deployed / In Progress / Confidential)` : `Status: ${statusCfg.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                          <IconComp size={11} className="shrink-0" />
                          <span className="font-semibold">{statusCfg.label}</span>
                          {isAdmin && isCurrent && (
                            <span className="text-[9px] opacity-60 ml-0.5" title="Click to switch status">⇄</span>
                          )}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Project Title — Clickable to redirect */}
                  <h3 
                    onClick={() => {
                      if (!isAdmin) handleSlideClick(project);
                    }}
                    className={`text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight mb-2 flex items-center gap-2 flex-wrap ${
                      hasLink && !isAdmin ? 'cursor-pointer hover:text-cyan-300 transition-colors' : ''
                    }`}
                  >
                    <EditableText
                      text={project.title}
                      isAdmin={isAdmin && isCurrent}
                      placeholder="Project Title"
                      onSave={(v) => handleUpdateField(project.id, 'title', v)}
                    />
                    {hasLink && !isAdmin && (
                      <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 text-cyan-400 inline shrink-0" />
                    )}
                  </h3>

                  {/* Project Description */}
                  <div className="text-slate-200/95 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-3 sm:line-clamp-4 max-w-2xl drop-shadow-sm">
                    <EditableText
                      text={project.description}
                      isAdmin={isAdmin && isCurrent}
                      placeholder="Click to add project description..."
                      multiline={true}
                      onSave={(v) => handleUpdateField(project.id, 'description', v)}
                    />
                  </div>

                  {/* Skills Tags List */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    {(project.skills || []).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.08] text-cyan-200 border border-white/[0.12] backdrop-blur-md inline-flex items-center gap-1.5 shadow-sm"
                      >
                        {skill}
                        {isAdmin && isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(project.id, skill)}
                            className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all cursor-pointer"
                            title={`Remove ${skill}`}
                          >
                            <X size={8} />
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Admin: Add skill inline */}
                    {isAdmin && isCurrent && addingSkillId !== project.id && (
                      <button
                        type="button"
                        onClick={() => { setAddingSkillId(project.id); setNewSkillText(''); }}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 border-dashed inline-flex items-center gap-1 hover:bg-cyan-500/30 transition-colors cursor-pointer backdrop-blur-md"
                      >
                        <Plus size={10} /> Add Skill
                      </button>
                    )}

                    {isAdmin && isCurrent && addingSkillId === project.id && (
                      <form
                        className="inline-flex items-center gap-1"
                        onSubmit={(e) => { e.preventDefault(); handleAddSkill(project.id); }}
                      >
                        <input
                          type="text"
                          value={newSkillText}
                          onChange={(e) => setNewSkillText(e.target.value)}
                          placeholder="Skill name"
                          className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-cyan-400 text-white text-[11px] font-mono outline-none w-24 backdrop-blur-md"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Escape') { setAddingSkillId(null); setNewSkillText(''); } }}
                        />
                        <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={11} /></button>
                        <button type="button" onClick={() => { setAddingSkillId(null); setNewSkillText(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={11} /></button>
                      </form>
                    )}
                  </div>

                  {/* Action Link Pills: Live Demo & GitHub Code */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Demo URL */}
                    {isAdmin && isCurrent ? (
                      editingUrl?.projectId === project.id && editingUrl?.field === 'demo' ? (
                        <form
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-emerald-400"
                          onSubmit={(e) => { e.preventDefault(); handleSaveUrl(project.id, 'demoUrl'); }}
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
                          onClick={() => { setEditingUrl({ projectId: project.id, field: 'demo' }); setUrlDraft(project.demoUrl || ''); }}
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
                    {isAdmin && isCurrent ? (
                      editingUrl?.projectId === project.id && editingUrl?.field === 'github' ? (
                        <form
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-cyan-400"
                          onSubmit={(e) => { e.preventDefault(); handleSaveUrl(project.id, 'githubUrl'); }}
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
                          onClick={() => { setEditingUrl({ projectId: project.id, field: 'github' }); setUrlDraft(project.githubUrl || ''); }}
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

        {/* ─── Navigation Arrow Buttons (Theme-Adaptive) ─── */}
        <motion.button
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 ${
            index === 0
              ? 'opacity-20 cursor-not-allowed bg-black/40 text-slate-500 border border-white/5'
              : 'bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/20 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-400 shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
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
              : 'bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/20 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-400 shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
          }`}
          title="Next Project"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* ─── Bottom Thumbnail Strip (Theme-Adaptive) ─── */}
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
                    ? 'border-2 border-sky-600 dark:border-cyan-400 shadow-[0_0_16px_rgba(2,132,199,0.4)] opacity-100 ring-2 ring-sky-400/40 dark:ring-cyan-400/50'
                    : 'border-2 border-slate-300 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-sky-400 dark:hover:border-white/30'
                }`}
                title={project.title || 'Project Thumbnail'}
              >
                {thumbUrl ? (
                  <ImageWithPlaceholder
                    src={thumbUrl}
                    alt={project.title || 'Project Thumbnail'}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    containerClassName="w-full h-full"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 border border-slate-800 flex items-center justify-center p-1 text-center">
                    <span className="text-[9px] font-mono text-slate-400 font-semibold truncate px-1">
                      {project.title || 'Project'}
                    </span>
                  </div>
                )}
                {project.photos && project.photos.length > 1 && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-950/85 text-[9px] font-mono text-cyan-300 border border-cyan-500/30 z-10 flex items-center gap-0.5">
                    <Images size={8} />
                    <span>{project.photos.length}</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5 z-10">
                    <span className="text-[10px] font-semibold text-white font-['Outfit'] truncate">
                      {project.title || 'Untitled'}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Navigation Legend Bar (Theme-Adaptive) ─── */}
      <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-400/90 text-center flex-wrap px-2 font-medium">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">◄</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">►</kbd>
          <span>Drag or arrows to explore projects</span>
        </span>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          <span>Click thumbnail to view details</span>
        </span>
      </div>

      {/* Admin Seed Helper if only fallback projects */}
      {isAdmin && projects.length > 0 && projects[0].id === '1' && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 px-2">
          <span className="text-amber-700 dark:text-amber-400/80 font-bold">Using fallback templates</span>
          <button
            type="button"
            onClick={handlePushDefaults}
            className="text-sky-700 dark:text-cyan-300 hover:underline cursor-pointer font-bold"
          >
            Push to Firestore DB
          </button>
        </div>
      )}
    </div>
  );
}
