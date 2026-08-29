import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
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
  FileText,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import EditableText from './EditableText';

const DEFAULT_CERT_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', // Tech / learning
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Cloud / network
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Cyber / dev
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Code / data
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Modern abstract
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // Workspace
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

const FULL_WIDTH_PX = 130;
const COLLAPSED_WIDTH_PX = 42;
const GAP_PX = 6;
const MARGIN_PX = 2;

export default function CertificatesCarousel({ isAdmin = false }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState({});

  // Admin inline-edit states
  const [editingUrl, setEditingUrl] = useState(null); // 'verify' | null
  const [urlDraft, setUrlDraft] = useState('');

  const containerRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const x = useMotionValue(0);

  // Fetch certificates from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchCertificates = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'certificates'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          if (isMounted) {
            setCertificates(list);
            setIndex(0);
          }
        } else {
          if (isMounted) {
            setCertificates(FALLBACK_CERTIFICATES);
            setIndex(0);
          }
        }
      } catch (err) {
        console.warn('Firestore fetch certificates fallback:', err);
        if (isMounted) {
          setCertificates(FALLBACK_CERTIFICATES);
          setIndex(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCertificates();
    return () => { isMounted = false; };
  }, []);

  // Currently active certificate
  const activeCert = useMemo(() => {
    return certificates[index] || certificates[0] || null;
  }, [certificates, index]);

  // Index string (01, 02, etc.)
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

  // Helper to get image for a certificate
  const getCertImage = (cert, idx) => {
    if (cert.imageUrl) return cert.imageUrl;
    return DEFAULT_CERT_IMAGES[idx % DEFAULT_CERT_IMAGES.length];
  };

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
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
    } catch (err) {
      console.warn('Add certificate local fallback:', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newCert };
      setCertificates(prev => {
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
    }
  };

  const handleUpdateField = async (field, value) => {
    if (!activeCert) return;
    setCertificates(prev => prev.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    ));
    try {
      await updateDoc(doc(db, 'certificates', activeCert.id), { [field]: value });
    } catch (err) {
      console.warn('Field update fallback (local only):', err);
    }
  };

  const handleSaveUrl = () => {
    handleUpdateField('verifyUrl', urlDraft.trim());
    setEditingUrl(null);
    setUrlDraft('');
  };

  const handleDeleteCert = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await deleteDoc(doc(db, 'certificates', id));
    } catch (err) {
      console.warn('Delete certificate local fallback:', err);
    }
    setCertificates(prev => {
      const filtered = prev.filter(c => c.id !== id);
      setIndex(prevIndex => Math.max(0, Math.min(filtered.length - 1, prevIndex)));
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

      setCertificates(prev => prev.map(c => {
        if (c.id === certId) {
          return { ...c, imageUrl: downloadUrl };
        }
        return c;
      }));
    } catch (err) {
      console.error('Error uploading certificate image:', err);
      alert('Certificate image upload failed. Check Firebase storage configuration.');
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
      setCertificates(prev => prev.map(c => {
        if (c.id === certId) {
          return { ...c, imageUrl: '' };
        }
        return c;
      }));
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

  // Main slide click -> redirect to verifyUrl
  const handleSlideClick = (cert) => {
    if (isDragging) return;
    if (cert.verifyUrl) {
      window.open(ensureAbsoluteUrl(cert.verifyUrl), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      {/* ─── Top Header / Controls ─── */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Award size={13} className="text-cyan-400" />
            <span>Certifications</span>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white/[0.03] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
            {activeIndexNumber} / {String(certificates.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                title="Add new certificate"
              >
                <Plus size={13} /> Add Certificate
              </button>

              {activeCert && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteCert(activeCert.id, e)}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
                  title="Delete current certificate"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
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

            newIndex = Math.max(0, Math.min(certificates.length - 1, newIndex));
            setIndex(newIndex);
          }}
          style={{ x }}
        >
          {certificates.map((cert, idx) => {
            const imageUrl = getCertImage(cert, idx);
            const isCurrent = idx === index;
            const hasVerifyLink = Boolean(cert.verifyUrl);
            const hasCustomImage = Boolean(cert.imageUrl);

            return (
              <div 
                key={cert.id || idx} 
                className="shrink-0 w-full h-[380px] sm:h-[430px] lg:h-[470px] relative overflow-hidden group select-none"
              >
                {/* Background Certificate Image / Thumbnail */}
                <img
                  src={imageUrl}
                  alt={cert.title}
                  className={`w-full h-full select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105 ${
                    hasCustomImage ? 'object-contain sm:object-cover' : 'object-cover'
                  }`}
                  draggable={false}
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />

                {/* Click to verify indicator hint (top right) */}
                {hasVerifyLink && !isAdmin && (
                  <div 
                    onClick={() => handleSlideClick(cert)}
                    className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-xs font-mono opacity-80 group-hover:opacity-100 group-hover:bg-cyan-500/20 cursor-pointer transition-all shadow-lg"
                    title="Click to verify certificate credential"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink size={12} />
                  </div>
                )}

                {/* Admin Image Controls (top right) */}
                {isAdmin && isCurrent && (
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    <label
                      title="Upload PDF screenshot / certificate image"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                    >
                      <Plus size={13} />
                      <span>{uploading[cert.id] ? 'Uploading...' : 'Upload Image'}</span>
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
                        className="p-1.5 rounded-xl bg-slate-950/80 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                        title="Delete certificate image"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    CERTIFICATE DETAILS OVERLAY (Lower-Left of the Active Card)
                   ───────────────────────────────────────────────────────────── */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-20 flex flex-col justify-end max-w-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Date & Badge Row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono font-semibold">
                      <ShieldCheck size={12} className="text-cyan-400" />
                      <span>Verified Certification</span>
                    </div>

                    <div className="text-xs font-mono text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-md">
                      <EditableText
                        text={cert.date}
                        isAdmin={isAdmin}
                        onSave={(v) => handleUpdateField('date', v)}
                        className="font-mono text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Certificate Title — Clickable to verify link */}
                  <h3 
                    onClick={() => {
                      if (!isAdmin) handleSlideClick(cert);
                    }}
                    className={`text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight mb-2 flex items-center gap-2 ${
                      hasVerifyLink && !isAdmin ? 'cursor-pointer hover:text-cyan-300 transition-colors' : ''
                    }`}
                  >
                    <EditableText
                      text={cert.title}
                      isAdmin={isAdmin}
                      onSave={(v) => handleUpdateField('title', v)}
                    />
                    {hasVerifyLink && !isAdmin && (
                      <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 text-cyan-400 inline shrink-0" />
                    )}
                  </h3>

                  {/* Issuer Name */}
                  <div className="text-sm sm:text-base font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-mono">Issued by:</span>
                    <EditableText
                      text={cert.issuer}
                      isAdmin={isAdmin}
                      onSave={(v) => handleUpdateField('issuer', v)}
                      className="text-cyan-300 font-semibold"
                    />
                  </div>

                  {/* Verification Action Pill */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {isAdmin ? (
                      editingUrl === 'verify' ? (
                        <form
                          className="inline-flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-cyan-400"
                          onSubmit={(e) => { e.preventDefault(); handleSaveUrl(); }}
                        >
                          <input
                            type="url"
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            placeholder="https://..."
                            className="px-2 py-0.5 rounded bg-transparent text-white text-xs outline-none w-52 font-mono"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrl(null); setUrlDraft(''); } }}
                          />
                          <button type="submit" className="p-0.5 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                          <button type="button" onClick={() => { setEditingUrl(null); setUrlDraft(''); }} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingUrl('verify'); setUrlDraft(cert.verifyUrl || ''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 border-dashed hover:bg-cyan-500/30 transition-all cursor-pointer backdrop-blur-md"
                          title="Click to edit verification link"
                        >
                          <Globe size={13} />
                          <span>{cert.verifyUrl ? 'Verify Link' : 'Set Verification URL'}</span>
                          <Edit3 size={10} className="text-cyan-400/70" />
                        </button>
                      )
                    ) : cert.verifyUrl ? (
                      <a
                        href={ensureAbsoluteUrl(cert.verifyUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-mono text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                        title="Verify Certificate Online"
                      >
                        <ShieldCheck size={13} />
                        <span>Verify Credential</span>
                        <ExternalLink size={11} />
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
          title="Previous Certificate"
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button
          disabled={index === certificates.length - 1}
          onClick={() => setIndex((i) => Math.min(certificates.length - 1, i + 1))}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-30 ${
            index === certificates.length - 1
              ? 'opacity-20 cursor-not-allowed bg-black/40 text-slate-500 border border-white/5'
              : 'bg-slate-950/70 text-white border border-white/20 hover:bg-cyan-500/30 hover:border-cyan-400/50 shadow-lg hover:scale-105 active:scale-95'
          }`}
          title="Next Certificate"
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
          {certificates.map((cert, i) => {
            const thumbUrl = getCertImage(cert, i);
            const isCurrent = i === index;

            return (
              <motion.button
                key={cert.id || i}
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
                title={cert.title}
              >
                <img
                  src={thumbUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-semibold text-white font-['Outfit'] truncate">
                      {cert.title}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Admin Seed Helper if only fallback certificates */}
      {isAdmin && certificates.length > 0 && certificates[0].id === '1' && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
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
