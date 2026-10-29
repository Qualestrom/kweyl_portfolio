import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  Lock,
  GripHorizontal
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { supabase, isSupabaseConfigured, uploadToSupabaseStorage } from '../supabase';
import { ensureAbsoluteUrl, resolveAssetUrl } from '../utils/imageUtils';
import { isGitHubRepoUrl, fetchGitHubRepoMetadata } from '../utils/githubUtils';
import EditableText from './EditableText';
import ImageWithPlaceholder from './ImageWithPlaceholder';
import useInputDevice from '../utils/useInputDevice';

// Status badge configurations for projects (Deployed, In Progress, Confidential)
const PROJECT_STATUS_CONFIG = {
  'deployed': {
    label: 'Deployed',
    colorClass: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[11px] font-mono inline-flex items-center gap-1.5',
    dotClass: 'w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0',
    icon: Globe,
  },
  'in-progress': {
    label: 'In Progress',
    colorClass: 'bg-sky-500/10 text-sky-300 border border-sky-500/30 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[11px] font-mono inline-flex items-center gap-1.5',
    dotClass: 'w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0',
    icon: Sparkles,
  },
  'confidential': {
    label: 'Confidential',
    colorClass: 'bg-amber-500/10 text-amber-300 border border-amber-500/30 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[11px] font-mono inline-flex items-center gap-1.5',
    dotClass: 'w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0',
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
  tag = '',
  skills = [],
  isCurrentSlide = false,
  isAdmin = false,
  projectId = '',
  uploadingStatus = false,
  onUploadPhotos,
  onRemovePhoto,
  onReorderPhotos,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // If photos array changes or gets smaller, clamp index safely
  useEffect(() => {
    if (photos.length > 0 && photoIndex >= photos.length) {
      setPhotoIndex(photos.length - 1);
    }
  }, [photos.length, photoIndex]);

  // Automatic slideshow transition when there are multiple photos (every 4.5s, pauses on hover)
  useEffect(() => {
    if (!isCurrentSlide || photos.length <= 1 || isHovered || isReordering) return;

    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isCurrentSlide, photos.length, isHovered, isReordering]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    if (onReorderPhotos) {
      onReorderPhotos(projectId, items);
    }
    setPhotoIndex(result.destination.index);
  };

  const hasPhotos = photos && photos.length > 0;
  const rawImageUrl = hasPhotos ? photos[photoIndex] : fallbackImage;
  const currentImageUrl = resolveAssetUrl(rawImageUrl);
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
      {/* Background Image with Smooth Crossfade (mode="sync" to overlap incoming/outgoing images) */}
      <AnimatePresence mode="sync">
        {currentImageUrl ? (
          <motion.div
            key={`${projectId}-img-${photoIndex}-${currentImageUrl}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
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
          <motion.div 
            key="empty-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-end justify-start p-6 sm:p-8 pt-8 sm:pt-10 select-none overflow-hidden"
            style={{ zIndex: 1 }}
          >
            {/* Subtle Architectural Blueprint Grid */}
            <div
              className="absolute inset-0 opacity-35 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(56,189,248,0.14),transparent_65%)] pointer-events-none" />

            {/* Intentional Upper-Right Architectural Preview Card */}
            <div className="relative z-10 flex flex-col items-end gap-2.5 max-w-xs sm:max-w-sm text-right rounded-2xl bg-slate-900/75 border border-sky-400/20 px-4 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sky-300">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300/90 font-semibold">
                  {tag || 'System Architecture'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <FolderGit2 size={15} />
                </div>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white/90 font-['Outfit'] tracking-tight">
                {title || 'Architecture Overview'}
              </div>
              {skills && skills.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1 pt-0.5">
                  {skills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-200/90 border border-sky-400/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {isAdmin && (
                <span className="text-[10px] font-mono text-sky-400/80 pt-1">
                  Use &ldquo;Add Photo&rdquo; to attach gallery media
                </span>
              )}
            </div>
          </motion.div>
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
              aria-label="Previous photo"
              className="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
              title="Previous Photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next photo"
              className="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
              title="Next Photo"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Photo Dots & Counter Badge */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-md pointer-events-auto select-none">
            <Images size={12} className="text-sky-400" />
            <div className="flex items-center gap-1">
              {photos.map((_, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  aria-label={`View photo ${pIdx + 1} of ${totalPhotos}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(pIdx);
                  }}
                  className={`h-1.5 rounded-full transition-colors duration-300 cursor-pointer ${
                    pIdx === photoIndex
                      ? 'w-4 bg-sky-400'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`View photo ${pIdx + 1} of ${totalPhotos}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-300 font-bold ml-1 tabular-nums">
              {photoIndex + 1}/{totalPhotos}
            </span>
          </div>
        </>
      )}

      {/* Admin Photo Management Controls (Top Left) */}
      {isAdmin && isCurrentSlide && !isReordering && (
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

          {hasPhotos && totalPhotos > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsReordering(true); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-sky-500/40 text-sky-400 hover:bg-sky-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
              title="Reorder photos"
            >
              <GripHorizontal size={12} />
              <span className="text-[11px] font-mono">Reorder</span>
            </button>
          )}

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

      {/* Reorder Overlay */}
      {isAdmin && isCurrentSlide && isReordering && (
        <div 
          className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 text-white font-bold font-['Outfit'] flex items-center gap-2 text-lg">
            <GripHorizontal className="text-cyan-400" /> Reorder Gallery Photos
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="photos" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 overflow-x-auto p-4 bg-slate-900/50 rounded-xl max-w-full items-center min-h-[140px]"
                >
                  {photos.map((url, index) => (
                    <Draggable key={url} draggableId={url} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                            snapshot.isDragging ? 'border-cyan-400 scale-105 shadow-xl shadow-cyan-500/20 z-50' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover pointer-events-none" />
                          <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white text-[10px] px-1.5 rounded font-mono border border-white/20">
                            {index + 1}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button
            onClick={() => setIsReordering(false)}
            className="mt-8 px-8 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Check size={16} /> Done Reordering
          </button>
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
    id: 'm7-grand-prix',
    title: 'M7 Grand Prix RSVP',
    tag: '3D Interactive Web Experience',
    category: 'Web Graphics & Event Platform',
    description: 'High-octane interactive Formula 1 event portal featuring a real-time Three.js 3D race circuit viewer, dynamic telemetry HUD, custom audio controller, driver registration, and Supabase backend.',
    skills: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Supabase', 'Framer Motion', 'Tailwind CSS', 'Canvas Confetti', 'Web Audio API'],
    demoUrl: 'https://m7-grand-prix.vercel.app',
    githubUrl: 'https://github.com/Qualestrom/m7-grand-prix-rsvp',
    status: 'deployed',
    photos: []
  },
  {
    id: 'the-pickle',
    title: 'The Pickle',
    tag: 'Mobile Platform & Booking Engine',
    category: 'Full-Stack Mobile Architecture',
    description: 'Enterprise-grade cross-platform community and venue management application engineered with React Native, Expo, and Supabase, featuring interactive court scheduling, real-time booking engines, push notifications, and geolocation.',
    skills: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL', 'RLS', 'Real-Time Subscriptions', 'Push Notifications', 'Geospatial Queries'],
    demoUrl: '',
    githubUrl: 'https://github.com/Qualestrom/the-pickle',
    status: 'deployed',
    photos: []
  },
  {
    id: '4qZN2lGENZnbe2gBZtNy',
    title: 'Stellar-Cryo CMS',
    tag: 'Personal Portfolio System',
    category: 'Web Application',
    description: 'An interactive portfolio and custom content management system built with React, featuring in-place administrative editing, dynamic asset pipelines, and canvas visual effects.',
    skills: ['JavaScript', 'CSS', 'TypeScript', 'HTML', 'React', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Supabase'],
    demoUrl: 'https://kweyl-portfolio.me/',
    githubUrl: 'https://github.com/Qualestrom/kweyl_portfolio',
    status: 'deployed',
    photos: [
      '/assets/recovered/projects/Screenshot 2026-09-06 112431.webp',
      '/assets/recovered/projects/Screenshot 2026-09-06 112550.webp',
      '/assets/recovered/projects/Screenshot 2026-09-06 112739.webp'
    ]
  },
  {
    id: '5',
    title: 'CREOSIM-MECHA',
    tag: 'TESDA MECHATRONICS NC II TRAINER',
    category: 'Cloud & Infrastructure',
    description: 'Modular e-learning platform integrating React, Konva.js, and Supabase to simulate complex mechatronics training boards with real-time state validation and circuit logic verification.',
    skills: ['TypeScript', 'React', 'Konva.js', 'Supabase', 'Tailwind CSS', 'HTML5 Canvas'],
    demoUrl: 'https://creotec-mechalab-x.vercel.app',
    githubUrl: 'https://github.com/Qualestrom/creotec-mechalab-x',
    status: 'confidential',
    photos: [
      '/assets/recovered/projects/Screenshot 2026-08-29 213630.webp',
      '/assets/recovered/projects/image (1).webp',
      '/assets/recovered/projects/image (2).webp',
      '/assets/recovered/projects/image.webp'
    ]
  },
  {
    id: '8WwyyZQN51XRGUEiJiAC',
    title: 'CRADLE',
    tag: 'MOBILE APPLICATION DORMITORY FINDER',
    category: 'Mobile Application',
    description: 'Cross-platform mobile accommodation portal engineered with Flutter and Supabase/Firebase, featuring dedicated onboarding flows, role-based access for tenants and landlords, and real-time listing queries.',
    skills: ['Dart', 'Flutter', 'Firebase', 'Supabase', 'Cross-Platform (Android / iOS)', 'Scrumban', 'UI/UX Design'],
    demoUrl: '',
    githubUrl: 'https://github.com/Qualestrom/CRADLE_PROJECT',
    status: 'confidential',
    photos: [
      '/assets/recovered/projects/Screenshot 2026-09-06 101759.webp',
      '/assets/recovered/projects/Screenshot 2026-09-06 101834.webp'
    ]
  }
];

const COLLAPSED_WIDTH_PX = 48;
const FULL_WIDTH_PX = 160;
const GAP_PX = 6;
const MARGIN_PX = 2;

export default function ProjectsShowcase({ isAdmin = false }) {
  const { isTouch, isMobile } = useInputDevice();
  const isTouchDevice = isTouch || isMobile;

  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          return parsed.map(p => ({
            ...p,
            photos: (p.photos || []).map(resolveAssetUrl)
          }));
        }
      }
      return FALLBACK_PROJECTS;
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

  const displayedProjects = projects;

  // Fetch projects from Supabase or Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        // 1. Try Supabase first if configured
        if (isSupabaseConfigured && supabase) {
          try {
            const { data, error } = await supabase
              .from('projects')
              .select('*')
              .order('sort_order', { ascending: true });

            if (!error && data && data.length > 0) {
              const list = data.map(item => ({
                ...item,
                photos: (item.photos || []).map(resolveAssetUrl)
              }));
              if (isMounted) {
                setProjects(list);
                try { localStorage.setItem('portfolio_projects', JSON.stringify(list)); } catch (_) {}
                setIndex(0);
                setLoading(false);
                return;
              }
            }
          } catch (supErr) {
            console.warn('Supabase fetch projects notice:', supErr);
          }
        }

        // 2. Fallback to Firestore
        const snapshot = await getDocs(collection(db, 'projects'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              photos: (data.photos || []).map(resolveAssetUrl)
            };
          });

          // Merge with any offline highlights (e.g. M7 Grand Prix, The Pickle)
          const existingTitles = new Set(list.map(p => (p.title || '').toLowerCase()));
          const additions = FALLBACK_PROJECTS.filter(fp => !existingTitles.has((fp.title || '').toLowerCase()));
          const mergedList = [...additions, ...list];

          if (isMounted) {
            setProjects(mergedList);
            try {
              localStorage.setItem('portfolio_projects', JSON.stringify(mergedList));
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
        console.warn('Fetch projects fallback:', err);
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

  // Currently active project from displayed list
  const activeProject = useMemo(() => {
    return displayedProjects[index] || displayedProjects[0] || null;
  }, [displayedProjects, index]);

  // Project index string (01, 02, etc.)
  const activeIndexNumber = useMemo(() => {
    return String(Math.min(index + 1, displayedProjects.length)).padStart(2, '0');
  }, [index, displayedProjects.length]);

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
    if (p.photos && p.photos.length > 0) return resolveAssetUrl(p.photos[0]);
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

    if (isSupabaseConfigured && supabase) {
      const newId = `proj-${Date.now()}`;
      try {
        await supabase.from('projects').insert({ id: newId, ...newProject });
      } catch (err) {
        console.warn('Add project Supabase fallback:', err);
      }
      const created = { id: newId, ...newProject };
      setProjects(prev => {
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
      return;
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').update({ [field]: value }).eq('id', projectId);
      } catch (err) {
        console.warn('Field update Supabase fallback:', err);
      }
      return;
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Delete project Supabase fallback:', err);
      }
    } else {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (err) {
        console.warn('Delete project local fallback:', err);
      }
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

      // Supabase upload path
      if (isSupabaseConfigured && supabase) {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploading(prev => ({ ...prev, [projectId]: `Uploading photo ${i + 1}/${files.length} to Supabase...` }));
          const { publicUrl } = await uploadToSupabaseStorage(`projects/${projectId}`, file);
          uploadedUrls.push(publicUrl);
        }

        const currentPhotos = (currentProj && Array.isArray(currentProj.photos)) ? [...currentProj.photos] : [];
        const updatedPhotos = [...currentPhotos, ...uploadedUrls];

        await supabase
          .from('projects')
          .update({ photos: updatedPhotos })
          .eq('id', projectId);

        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, photos: updatedPhotos };
          }
          return p;
        }));
        return;
      }

      // Firebase upload path fallback
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
      alert('Photo upload notice: ' + (err.message || 'Check storage configuration.'));
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

  const handleReorderPhotos = async (projectId, newPhotosArray) => {
    try {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, photos: newPhotosArray };
        }
        return p;
      }));

      await updateDoc(doc(db, 'projects', projectId), {
        photos: newPhotosArray
      });
    } catch (err) {
      console.error('Error reordering photos:', err);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/25 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Selected Work
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] px-2.5 py-0.5 rounded-full font-bold">
            {activeIndexNumber} / {String(displayedProjects.length).padStart(2, '0')}
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
      <div 
        className="projects-carousel relative overflow-hidden rounded-2xl lg:rounded-3xl border border-slate-300/80 dark:border-white/[0.1] bg-slate-950/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]" 
        ref={containerRef}
        data-no-swipe="true"
      >

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

            newIndex = Math.max(0, Math.min(displayedProjects.length - 1, newIndex));
            setIndex(newIndex);
          }}
          style={{ x }}
        >
          {displayedProjects.map((project, idx) => {
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
                  tag={project.tag || project.category || ''}
                  skills={project.skills || []}
                  isCurrentSlide={isCurrent}
                  isAdmin={isAdmin}
                  projectId={project.id}
                  uploadingStatus={uploading[project.id]}
                  onUploadPhotos={handleUploadPhotos}
                  onRemovePhoto={handleRemovePhoto}
                  onReorderPhotos={handleReorderPhotos}
                />

                {/* Soft gradient overlay — keeps screenshot bright & clear while ensuring text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-transparent to-transparent pointer-events-none z-10" />

                {/* Scanning / Uploading Status Overlay */}
                {Boolean(uploading[project.id]) && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2.5 text-sky-300 text-xs font-mono z-40 backdrop-blur-md">
                    <Sparkles size={24} className="animate-spin text-sky-400" />
                    <span className="font-bold text-sm text-sky-200">
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
                      className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold drop-shadow-sm"
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border backdrop-blur-md transition-colors select-none ${statusCfg.colorClass} ${
                            isAdmin && isCurrent ? 'cursor-pointer hover:brightness-125 hover:border-sky-400 active:scale-95' : 'cursor-default'
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

                  {/* Project Title */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight mb-2 flex items-center gap-2 flex-wrap">
                    <EditableText
                      text={project.title}
                      isAdmin={isAdmin && isCurrent}
                      placeholder="Project Title"
                      onSave={(v) => handleUpdateField(project.id, 'title', v)}
                    />
                  </h3>

                  {/* Project Description */}
                  <div className={`text-slate-200/95 text-xs sm:text-sm leading-relaxed mb-3 max-w-2xl drop-shadow-sm ${isAdmin && isCurrent ? '' : 'line-clamp-3 sm:line-clamp-4'}`}>
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
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-mono text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer active:scale-95"
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
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-sky-400"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-sky-300 bg-sky-500/20 border border-sky-500/40 border-dashed hover:bg-sky-500/30 transition-colors cursor-pointer backdrop-blur-md"
                          title="Click to edit GitHub URL"
                        >
                          <FolderGit2 size={13} />
                          <span>{project.githubUrl ? 'Source Code' : 'Set Repo URL'}</span>
                          <Edit3 size={10} className="text-sky-400/70" />
                        </button>
                      )
                    ) : project.githubUrl ? (
                      <a
                        href={ensureAbsoluteUrl(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-200 bg-white/[0.08] border border-white/[0.15] hover:border-sky-400/50 hover:bg-sky-500/20 hover:text-sky-200 transition-colors cursor-pointer backdrop-blur-md active:scale-95"
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
          aria-label="Previous project"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-30 ${
            index === 0
              ? 'opacity-20 cursor-not-allowed bg-black/40 text-slate-500 border border-white/5'
              : 'bg-white dark:bg-slate-950/70 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/20 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-400 shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
          }`}
          title="Previous Project"
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button
          disabled={index === displayedProjects.length - 1}
          aria-label="Next project"
          onClick={() => setIndex((i) => Math.min(displayedProjects.length - 1, i + 1))}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-30 ${
            index === displayedProjects.length - 1
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
          {displayedProjects.map((project, i) => {
            const thumbUrl = getProjectImage(project, i);
            const isCurrent = i === index;

            return (
              <motion.button
                key={project.id || i}
                onClick={() => setIndex(i)}
                aria-label={`Select project ${project.title || i + 1}`}
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
                className={`relative shrink-0 h-full overflow-hidden rounded-xl border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'border-2 border-sky-600 dark:border-sky-400 opacity-100 ring-2 ring-sky-400/40 dark:ring-sky-400/50'
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
                  <div className="w-full h-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-1 text-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)',
                        backgroundSize: '12px 12px',
                      }}
                    />
                    <FolderGit2 size={14} className="text-sky-400/80 mb-0.5 relative z-10 shrink-0" />
                    <span className="text-[9px] font-mono text-slate-300 font-semibold truncate px-1 max-w-full relative z-10">
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
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-400/90 text-center flex-wrap px-2 font-medium">
        {isTouchDevice ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span>Swipe to explore projects</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <span>Tap thumbnail to view details</span>
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">◄</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">►</kbd>
              <span>Drag or arrows to explore projects</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              <span>Click thumbnail to view details</span>
            </span>
          </>
        )}
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
