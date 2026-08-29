import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Check, 
  X, 
  ShieldCheck, 
  Globe, 
  Upload
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import EditableText from './EditableText';

const DEFAULT_CERT_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', // Tech / learning
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Cloud / network
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', // Cyber / dev
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Code / data
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', // Modern abstract
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', // Workspace
];

const FALLBACK_CERTIFICATES = [
  {
    id: '1',
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2023',
    imageUrl: '',
    verifyUrl: 'https://aws.amazon.com/certification/'
  },
  {
    id: '2',
    title: 'Google Professional Cloud Developer',
    issuer: 'Google Cloud',
    date: '2023',
    imageUrl: '',
    verifyUrl: 'https://cloud.google.com/certification'
  },
  {
    id: '3',
    title: 'Meta Front-End Developer',
    issuer: 'Meta',
    date: '2022',
    imageUrl: '',
    verifyUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
  },
  {
    id: '4',
    title: 'Certified Kubernetes Administrator',
    issuer: 'CNCF',
    date: '2024',
    imageUrl: '',
    verifyUrl: 'https://www.cncf.io/certification/cka/'
  },
  {
    id: '5',
    title: 'Advanced React Patterns',
    issuer: 'Frontend Masters',
    date: '2022',
    imageUrl: '',
    verifyUrl: 'https://frontendmasters.com'
  },
  {
    id: '6',
    title: 'Full Stack Open',
    issuer: 'University of Helsinki',
    date: '2021',
    imageUrl: '',
    verifyUrl: 'https://fullstackopen.com'
  }
];

// Individual Landscape 3D Certificate Card
const LandscapeCarouselCard = ({
  cert,
  idx,
  total,
  rotation,
  translateZ,
  isActive,
  isAdmin,
  editingUrlId,
  urlDraft,
  uploading,
  setEditingUrlId,
  setUrlDraft,
  handleUpdateField,
  handleSaveUrl,
  handleDeleteCert,
  handleUploadImage,
  handleRemoveImage,
  onClickCard,
}) => {
  const angle = (360 / Math.max(total, 1)) * idx;
  const fallbackImg = DEFAULT_CERT_IMAGES[idx % DEFAULT_CERT_IMAGES.length];
  const certImage = cert.imageUrl || fallbackImg;
  const hasCustomImage = Boolean(cert.imageUrl);
  const isEditingUrl = editingUrlId === cert.id;

  // Calculate dynamic front-facing angle and opacity
  const opacity = useTransform(rotation, (r) => {
    let currentGlobalAngle = (angle + r) % 360;
    if (currentGlobalAngle < 0) currentGlobalAngle += 360;
    // Front card is centered around 0/360
    if (currentGlobalAngle < 75 || currentGlobalAngle > 285) {
      return 1;
    }
    // Flanking cards
    if (currentGlobalAngle < 120 || currentGlobalAngle > 240) {
      return 0.55;
    }
    // Rear cards
    return 0.25;
  });

  const pointerEvents = useTransform(rotation, (r) => {
    let currentGlobalAngle = (angle + r) % 360;
    if (currentGlobalAngle < 0) currentGlobalAngle += 360;
    if (currentGlobalAngle < 75 || currentGlobalAngle > 285) {
      return 'auto';
    }
    return 'auto'; // Allow clicking side cards to navigate to them
  });

  return (
    <motion.div
      onClick={() => {
        if (!isActive) onClickCard(idx);
      }}
      className={`absolute inset-0 rounded-2xl border transition-colors duration-300 flex flex-col justify-between cursor-pointer ${
        isActive
          ? 'border-cyan-400/80 bg-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(34,211,238,0.25)] z-20'
          : 'border-white/15 bg-slate-900/95 shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:border-white/30 z-10'
      }`}
      style={{
        transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
        opacity,
        pointerEvents,
      }}
    >
      {/* ─── Top Landscape Certificate Image / Thumbnail Banner ─── */}
      <div className="relative w-full h-[125px] sm:h-[140px] bg-slate-950 rounded-t-2xl overflow-hidden border-b border-white/[0.08] group/img shrink-0">
        <img
          src={certImage}
          alt={cert.title}
          className={`w-full h-full select-none pointer-events-none transition-transform duration-500 group-hover/img:scale-105 ${
            hasCustomImage ? 'object-contain bg-slate-950 p-2' : 'object-cover'
          }`}
          draggable={false}
        />

        {/* Gradient shadow for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Right Admin Image Controls */}
        {isAdmin && isActive && (
          <div 
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <label
              title="Upload Certificate PDF screenshot or image"
              className="p-1.5 rounded-lg bg-slate-950/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-md"
            >
              <Upload size={12} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading[cert.id]}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUploadImage(cert.id, e.target.files[0]);
                }}
              />
            </label>

            {cert.imageUrl && (
              <button
                type="button"
                onClick={(e) => handleRemoveImage(cert.id, e)}
                className="p-1.5 rounded-lg bg-slate-950/90 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-md"
                title="Remove custom image"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}

        {/* Top Left Verified Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono shadow-sm">
          <ShieldCheck size={11} className="text-cyan-400" />
          <span>Verified</span>
        </div>

        {/* Uploading Status Overlay */}
        {uploading[cert.id] && (
          <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center text-cyan-300 text-xs font-mono z-30">
            Uploading Certificate Image...
          </div>
        )}
      </div>

      {/* ─── Bottom Details & Text Section (No overflow-hidden so Edit badges float freely) ─── */}
      <div 
        className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between relative"
        onClick={(e) => {
          if (isActive) e.stopPropagation();
        }}
      >
        <div>
          {/* Issuer & Date Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-mono text-cyan-400 font-semibold truncate flex-1">
              <EditableText
                text={cert.issuer}
                isAdmin={isAdmin && isActive}
                onSave={(v) => handleUpdateField(cert.id, 'issuer', v)}
              />
            </div>

            <div className="text-[10px] font-mono text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-full shrink-0">
              <EditableText
                text={cert.date}
                isAdmin={isAdmin && isActive}
                onSave={(v) => handleUpdateField(cert.id, 'date', v)}
              />
            </div>
          </div>

          {/* Certificate Title */}
          <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit'] tracking-tight leading-snug">
            <EditableText
              text={cert.title}
              isAdmin={isAdmin && isActive}
              onSave={(v) => handleUpdateField(cert.id, 'title', v)}
            />
          </h3>
        </div>

        {/* ─── Bottom Actions Row (Verify Link & Admin Actions) ─── */}
        <div className="pt-2 mt-1 border-t border-white/[0.08] flex items-center justify-between gap-2">
          {isAdmin && isActive ? (
            isEditingUrl ? (
              <form
                className="flex-1 flex items-center gap-1"
                onSubmit={(e) => { e.preventDefault(); handleSaveUrl(cert.id); }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://credential-link..."
                  className="px-2 py-0.5 rounded bg-slate-950 border border-cyan-400 text-white text-[11px] font-mono outline-none w-full"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrlId(null); setUrlDraft(''); } }}
                />
                <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={11} /></button>
                <button type="button" onClick={() => { setEditingUrlId(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={11} /></button>
              </form>
            ) : (
              <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { setEditingUrlId(cert.id); setUrlDraft(cert.verifyUrl || ''); }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 hover:underline cursor-pointer"
                  title="Edit verification link"
                >
                  <Globe size={12} />
                  <span>{cert.verifyUrl ? 'Edit Link' : 'Set Link'}</span>
                  <Edit3 size={9} className="opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteCert(cert.id, e)}
                  className="p-1 rounded-md text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete certificate"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          ) : cert.verifyUrl ? (
            <a
              href={ensureAbsoluteUrl(cert.verifyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-semibold font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Verify Certificate Credential Online"
            >
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Verify Credential</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <div className="w-full text-center text-[11px] font-mono text-slate-500 py-0.5">
              Credential on Record
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CertificatesCarousel({ isAdmin = false }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState({});
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Admin inline URL edit state
  const [editingUrlId, setEditingUrlId] = useState(null);
  const [urlDraft, setUrlDraft] = useState('');

  const rotation = useMotionValue(0);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch certificates from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchCertificates = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'certificates'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (isMounted) setCertificates(list);
        } else {
          if (isMounted) setCertificates(FALLBACK_CERTIFICATES);
        }
      } catch (err) {
        console.warn('Firestore fetch certificates fallback:', err);
        if (isMounted) setCertificates(FALLBACK_CERTIFICATES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCertificates();
    return () => { isMounted = false; };
  }, []);

  // Smooth Snap Animation when activeIndex changes
  useEffect(() => {
    if (certificates.length === 0 || isDragging) return;
    const stepAngle = 360 / certificates.length;
    const targetRotation = -activeIndex * stepAngle;

    animate(rotation, targetRotation, {
      type: 'spring',
      stiffness: 220,
      damping: 26,
    });
  }, [activeIndex, certificates.length, isDragging, rotation]);

  // Step rotation helpers
  const handlePrev = () => {
    if (certificates.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  const handleNext = () => {
    if (certificates.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % certificates.length);
  };

  const handleSelectCard = (index) => {
    setActiveIndex(index);
  };

  // Pan / Drag gesture with smooth snap on release
  const handlePanStart = (e, info) => {
    setIsDragging(true);
    dragStartX.current = info.point.x;
    dragStartRotation.current = rotation.get();
  };

  const handlePan = (e, info) => {
    const deltaX = info.point.x - dragStartX.current;
    rotation.set(dragStartRotation.current + deltaX * 0.35);
  };

  const handlePanEnd = (e, info) => {
    setIsDragging(false);
    if (certificates.length === 0) return;

    const stepAngle = 360 / certificates.length;
    const currentRot = rotation.get();
    
    // Determine closest card index
    let rawIndex = Math.round(-currentRot / stepAngle);
    let newIndex = ((rawIndex % certificates.length) + certificates.length) % certificates.length;
    
    // If fast swipe gesture, advance by 1
    if (info.velocity.x > 300) {
      newIndex = (activeIndex - 1 + certificates.length) % certificates.length;
    } else if (info.velocity.x < -300) {
      newIndex = (activeIndex + 1) % certificates.length;
    }

    setActiveIndex(newIndex);
  };

  // Dynamic 3D radius calculation for landscape cards
  const translateZ = useMemo(() => {
    const total = Math.max(certificates.length, 3);
    const cardWidth = windowWidth > 1024 ? 440 : windowWidth > 640 ? 380 : 320;
    const angleRad = Math.PI / total;
    const computedRadius = Math.round((cardWidth / 2) / Math.tan(angleRad));
    return Math.max(windowWidth > 768 ? 360 : 280, computedRadius + 30);
  }, [certificates.length, windowWidth]);

  // ─── Admin Handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = async () => {
    const newCert = {
      title: 'New Certificate',
      issuer: 'Issuing Organization',
      date: new Date().getFullYear().toString(),
      imageUrl: '',
      verifyUrl: '',
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'certificates'), newCert);
      const created = { id: docRef.id, ...newCert };
      setCertificates(prev => {
        const updated = [...prev, created];
        setActiveIndex(updated.length - 1);
        return updated;
      });
    } catch (err) {
      console.warn('Add certificate fallback (local only):', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newCert };
      setCertificates(prev => {
        const updated = [...prev, created];
        setActiveIndex(updated.length - 1);
        return updated;
      });
    }
  };

  const handleUpdateField = async (id, field, value) => {
    setCertificates(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
    try {
      await updateDoc(doc(db, 'certificates', id), { [field]: value });
    } catch (err) {
      console.warn('Certificate update fallback (local only):', err);
    }
  };

  const handleSaveUrl = (id) => {
    handleUpdateField(id, 'verifyUrl', urlDraft.trim());
    setEditingUrlId(null);
    setUrlDraft('');
  };

  const handleDeleteCert = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await deleteDoc(doc(db, 'certificates', id));
    } catch (err) {
      console.warn('Delete cert local fallback:', err);
    }
    setCertificates(prev => {
      const filtered = prev.filter(c => c.id !== id);
      setActiveIndex(prevIdx => Math.min(prevIdx, Math.max(0, filtered.length - 1)));
      return filtered;
    });
  };

  const handleUploadImage = async (certId, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [certId]: true }));
    try {
      if (['1', '2', '3', '4', '5', '6'].includes(certId)) {
        const fc = FALLBACK_CERTIFICATES.find(c => c.id === certId);
        if (fc) {
          const { id, ...data } = fc;
          await setDoc(doc(db, 'certificates', certId), data, { merge: true });
        }
      }

      const storageRef = ref(storage, `certificates/${certId}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'certificates', certId), {
        imageUrl: downloadUrl
      });

      setCertificates(prev => prev.map(c =>
        c.id === certId ? { ...c, imageUrl: downloadUrl } : c
      ));
    } catch (err) {
      console.error('Error uploading certificate image:', err);
      alert('Upload failed. Check Firebase storage configuration.');
    } finally {
      setUploading(prev => ({ ...prev, [certId]: false }));
    }
  };

  const handleRemoveImage = async (certId, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Remove image for this certificate?')) return;
    try {
      await updateDoc(doc(db, 'certificates', certId), {
        imageUrl: ''
      });
      setCertificates(prev => prev.map(c =>
        c.id === certId ? { ...c, imageUrl: '' } : c
      ));
    } catch (err) {
      console.error('Error removing certificate image:', err);
    }
  };

  const handlePushDefaults = async () => {
    if (!window.confirm('Push default certificates to Firebase database?')) return;
    try {
      for (const fc of FALLBACK_CERTIFICATES) {
        const { id, ...data } = fc;
        await setDoc(doc(db, 'certificates', id), { ...data });
      }
      alert('Certificates successfully saved to Firestore!');
    } catch (err) {
      console.error('Push defaults error:', err);
      alert('Error pushing defaults to database.');
    }
  };

  return (
    <div className="w-full flex flex-col justify-center select-none py-2">
      {/* ─── Header Bar with Step Navigation & Admin Actions ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <Award size={13} className="text-cyan-400" />
              <span>Certifications</span>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
              {String(activeIndex + 1).padStart(2, '0')} / {String(certificates.length).padStart(2, '0')}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono hidden sm:block">
            Drag or click arrows to explore • Click any certificate to bring to front
          </p>
        </div>

        {/* Orbit Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Previous Certificate (Rotate Left)"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Next Certificate (Rotate Right)"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors cursor-pointer shadow-md"
              title="Add new certificate"
            >
              <Plus size={13} /> Add Credential
            </button>
          )}
        </div>
      </div>

      {/* ─── 3D PERSPECTIVE CAROUSEL STAGE (Landscape Cards) ─── */}
      <div 
        className="w-full relative h-[380px] sm:h-[420px] lg:h-[450px] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          className="relative w-[330px] sm:w-[410px] lg:w-[450px] h-[245px] sm:h-[270px] cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: 'preserve-3d',
            rotateY: rotation,
          }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          {certificates.map((cert, idx) => (
            <LandscapeCarouselCard
              key={cert.id || idx}
              cert={cert}
              idx={idx}
              total={certificates.length}
              rotation={rotation}
              translateZ={translateZ}
              isActive={idx === activeIndex}
              isAdmin={isAdmin}
              editingUrlId={editingUrlId}
              urlDraft={urlDraft}
              uploading={uploading}
              setEditingUrlId={setEditingUrlId}
              setUrlDraft={setUrlDraft}
              handleUpdateField={handleUpdateField}
              handleSaveUrl={handleSaveUrl}
              handleDeleteCert={handleDeleteCert}
              handleUploadImage={handleUploadImage}
              handleRemoveImage={handleRemoveImage}
              onClickCard={handleSelectCard}
            />
          ))}
        </motion.div>
      </div>

      {/* Admin Template Helper */}
      {isAdmin && certificates.length > 0 && certificates[0].id === '1' && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
          <span className="text-amber-400/80">Using fallback certificate templates</span>
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
