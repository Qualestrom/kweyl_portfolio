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
  Upload,
  MousePointerClick,
  FileText,
  Sparkles
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import { isPdfFile, renderPdfFirstPageToImage, extractPdfCertificateMetadata } from '../utils/pdfUtils';
import EditableText from './EditableText';
import ImageWithPlaceholder from './ImageWithPlaceholder';

const DEFAULT_CERT_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
];

const FALLBACK_CERTIFICATES = [
  {
    id: '1',
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    date: '2023',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://aws.amazon.com/certification/'
  },
  {
    id: '2',
    title: 'Google Professional Cloud Developer',
    issuer: 'Google Cloud',
    date: '2023',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://cloud.google.com/certification'
  },
  {
    id: '3',
    title: 'Meta Front-End Developer',
    issuer: 'Meta',
    date: '2022',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
  },
  {
    id: '4',
    title: 'Certified Kubernetes Administrator',
    issuer: 'CNCF',
    date: '2024',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://www.cncf.io/certification/cka/'
  },
  {
    id: '5',
    title: 'Advanced React Patterns',
    issuer: 'Frontend Masters',
    date: '2022',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://frontendmasters.com'
  },
  {
    id: '6',
    title: 'Full Stack Open',
    issuer: 'University of Helsinki',
    date: '2021',
    imageUrl: '',
    pdfUrl: '',
    verifyUrl: 'https://fullstackopen.com'
  }
];

// Individual High-Resolution Landscape 3D Certificate Card
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
  handleUploadDocument,
  handleRemoveDocument,
  onClickCard,
}) => {
  const angle = (360 / Math.max(total, 1)) * idx;
  const fallbackImg = DEFAULT_CERT_IMAGES[idx % DEFAULT_CERT_IMAGES.length];
  const certImage = cert.imageUrl || fallbackImg;
  const hasCustomImage = Boolean(cert.imageUrl);
  const isEditingUrl = editingUrlId === cert.id;
  const isUploading = Boolean(uploading[cert.id]);
  const uploadStatus = typeof uploading[cert.id] === 'string' ? uploading[cert.id] : 'Uploading...';

  // Effective destination URL (verify link or PDF URL)
  const targetLink = cert.verifyUrl || cert.pdfUrl || '';

  // Calculate dynamic front-facing angle and opacity
  const opacity = useTransform(rotation, (r) => {
    let currentGlobalAngle = (angle + r) % 360;
    if (currentGlobalAngle < 0) currentGlobalAngle += 360;
    if (currentGlobalAngle < 75 || currentGlobalAngle > 285) {
      return 1;
    }
    if (currentGlobalAngle < 120 || currentGlobalAngle > 240) {
      return 0.45;
    }
    return 0.18;
  });

  return (
    <motion.div
      onClick={() => {
        if (!isActive) onClickCard(idx);
      }}
      className={`absolute inset-0 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isActive
          ? 'border-cyan-400/90 bg-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(34,211,238,0.25)] z-20 ring-1 ring-cyan-400/40'
          : 'border-white/12 bg-slate-900/95 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:border-white/25 z-10'
      }`}
      style={{
        transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
        opacity,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      }}
    >
      {/* ─── Top Landscape Certificate Frame (Seamless Edge-to-Edge Display) ─── */}
      <div className="relative w-full h-[145px] sm:h-[170px] md:h-[190px] lg:h-[200px] bg-slate-950 rounded-t-2xl overflow-hidden border-b border-white/[0.1] group/img shrink-0 flex items-center justify-center">
        <ImageWithPlaceholder
          src={certImage}
          alt={cert.title}
          className={`w-full h-full select-none pointer-events-none transition-transform duration-500 group-hover/img:scale-102 ${
            hasCustomImage ? 'object-cover object-top bg-white' : 'object-cover object-center'
          }`}
          containerClassName="w-full h-full"
          showSpinner={true}
          draggable={false}
        />

        {/* Top Right Admin Controls */}
        {isAdmin && isActive && (
          <div 
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <label
              title="Upload PDF certificate (Auto-scans title, issuer & date)"
              className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer backdrop-blur-md transition-colors shadow-lg inline-flex items-center gap-1.5"
            >
              <Upload size={12} />
              <span>{isUploading ? 'Scanning...' : 'Upload PDF/Img'}</span>
              <input
                type="file"
                accept="image/*, .pdf, application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUploadDocument(cert.id, e.target.files[0]);
                }}
              />
            </label>

            {(cert.imageUrl || cert.pdfUrl) && (
              <button
                type="button"
                onClick={(e) => handleRemoveDocument(cert.id, e)}
                className="p-1.5 rounded-lg bg-slate-950/90 border border-red-500/50 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                title="Remove uploaded document/image"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}

        {/* Top Left Verified Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono shadow-md backdrop-blur-md">
          <ShieldCheck size={11} className="text-cyan-400" />
          <span>{cert.pdfUrl ? 'Verified PDF' : 'Verified'}</span>
        </div>

        {/* Uploading / Scanning Status Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-1.5 text-cyan-300 text-xs font-mono z-30">
            <Sparkles size={18} className="animate-spin text-cyan-400" />
            <span className="font-semibold animate-pulse">{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* ─── Bottom Details & Text Section (No overflow-hidden so Edit badges float freely) ─── */}
      <div 
        className="p-3.5 sm:p-4 md:p-4.5 flex-1 flex flex-col justify-between relative"
        onClick={(e) => {
          if (isActive) e.stopPropagation();
        }}
      >
        <div>
          {/* Issuer & Date Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] sm:text-xs font-mono text-cyan-400 font-semibold truncate flex-1 tracking-wide">
              <EditableText
                text={cert.issuer}
                isAdmin={isAdmin && isActive}
                onSave={(v) => handleUpdateField(cert.id, 'issuer', v)}
              />
            </div>

            <div className="text-[10px] sm:text-xs font-mono text-slate-300 bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 rounded-full shrink-0 font-medium">
              <EditableText
                text={cert.date}
                isAdmin={isAdmin && isActive}
                onSave={(v) => handleUpdateField(cert.id, 'date', v)}
              />
            </div>
          </div>

          {/* Certificate Title */}
          <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] tracking-tight leading-snug">
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
                className="flex-1 flex items-center gap-1.5"
                onSubmit={(e) => { e.preventDefault(); handleSaveUrl(cert.id); }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://credential-link..."
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-white text-xs font-mono outline-none w-full"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrlId(null); setUrlDraft(''); } }}
                />
                <button type="submit" className="p-1 text-green-400 hover:text-green-300 cursor-pointer"><Check size={12} /></button>
                <button type="button" onClick={() => { setEditingUrlId(null); setUrlDraft(''); }} className="p-1 text-red-400 hover:text-red-300 cursor-pointer"><X size={12} /></button>
              </form>
            ) : (
              <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { setEditingUrlId(cert.id); setUrlDraft(cert.verifyUrl || cert.pdfUrl || ''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:underline cursor-pointer"
                  title="Edit verification link"
                >
                  <Globe size={13} />
                  <span>{cert.verifyUrl ? 'Edit Link' : cert.pdfUrl ? 'PDF Attached' : 'Set Link'}</span>
                  <Edit3 size={10} className="opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteCert(cert.id, e)}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete certificate"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          ) : targetLink ? (
            <a
              href={ensureAbsoluteUrl(targetLink)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-semibold font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Open Certificate Document / Credential Verification"
            >
              {cert.pdfUrl && !cert.verifyUrl ? (
                <>
                  <FileText size={13} className="text-cyan-400" />
                  <span>View PDF Certificate</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={13} className="text-cyan-400" />
                  <span>Verify Credential</span>
                </>
              )}
              <ExternalLink size={11} />
            </a>
          ) : (
            <div className="w-full text-center text-xs font-mono text-slate-400 py-0.5">
              Credential on Record
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CertificatesCarousel({ isAdmin = false }) {
  const [certificates, setCertificates] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_certificates');
      return cached ? JSON.parse(cached) : FALLBACK_CERTIFICATES;
    } catch (_) {
      return FALLBACK_CERTIFICATES;
    }
  });
  const [loading, setLoading] = useState(true);
  const [targetAngle, setTargetAngle] = useState(0);
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
          if (isMounted) {
            setCertificates(list);
            try {
              localStorage.setItem('portfolio_certificates', JSON.stringify(list));
            } catch (_) {}
          }
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

  // Dynamic continuous active index calculation (never wraps/reverses rotation)
  const activeIndex = useMemo(() => {
    if (certificates.length === 0) return 0;
    const stepAngle = 360 / certificates.length;
    const rawIdx = Math.round(-targetAngle / stepAngle);
    return ((rawIdx % certificates.length) + certificates.length) % certificates.length;
  }, [targetAngle, certificates.length]);

  // Smooth continuous spring animation to targetAngle
  useEffect(() => {
    if (certificates.length === 0 || isDragging) return;

    animate(rotation, targetAngle, {
      type: 'spring',
      stiffness: 240,
      damping: 28,
    });
  }, [targetAngle, certificates.length, isDragging, rotation]);

  // Continuous 1-Way Infinite Step Navigation
  const handlePrev = () => {
    if (certificates.length === 0) return;
    const stepAngle = 360 / certificates.length;
    setTargetAngle(prev => prev + stepAngle);
  };

  const handleNext = () => {
    if (certificates.length === 0) return;
    const stepAngle = 360 / certificates.length;
    setTargetAngle(prev => prev - stepAngle);
  };

  // Click adjacent card or indicator dot to rotate via shortest angular path
  const handleSelectCard = (clickedIdx) => {
    if (certificates.length === 0) return;
    const total = certificates.length;
    const stepAngle = 360 / total;
    
    const currentFrontIdx = (((Math.round(-targetAngle / stepAngle) % total) + total) % total);
    
    let diff = clickedIdx - currentFrontIdx;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    setTargetAngle(prev => prev - diff * stepAngle);
  };

  // Continuous Pan / Drag with momentum snap
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
    
    let targetSteps = Math.round(currentRot / stepAngle);
    
    if (info.velocity.x > 250) {
      targetSteps = Math.ceil(currentRot / stepAngle);
    } else if (info.velocity.x < -250) {
      targetSteps = Math.floor(currentRot / stepAngle);
    }

    setTargetAngle(targetSteps * stepAngle);
  };

  // Dynamic 3D radius calculation for balanced landscape cards
  const translateZ = useMemo(() => {
    const total = Math.max(certificates.length, 3);
    const cardWidth = windowWidth > 1024 ? 540 : windowWidth > 768 ? 480 : windowWidth > 640 ? 420 : 310;
    const angleRad = Math.PI / total;
    const computedRadius = Math.round((cardWidth / 2) / Math.tan(angleRad));
    return Math.max(windowWidth > 768 ? 400 : 280, computedRadius + 30);
  }, [certificates.length, windowWidth]);

  // ─── Admin Handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = async () => {
    const newCert = {
      title: 'New Certificate',
      issuer: 'Issuing Organization',
      date: new Date().getFullYear().toString(),
      imageUrl: '',
      pdfUrl: '',
      verifyUrl: '',
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'certificates'), newCert);
      const created = { id: docRef.id, ...newCert };
      setCertificates(prev => [...prev, created]);
    } catch (err) {
      console.warn('Add certificate fallback (local only):', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newCert };
      setCertificates(prev => [...prev, created]);
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
    setCertificates(prev => prev.filter(c => c.id !== id));
  };

  // Upload either PDF document or Image File with Smart Metadata Scanning
  const handleUploadDocument = async (certId, file) => {
    if (!file) return;
    const isPdf = isPdfFile(file);

    setUploading(prev => ({ 
      ...prev, 
      [certId]: isPdf ? 'Scanning PDF text...' : 'Uploading image...' 
    }));

    try {
      if (['1', '2', '3', '4', '5', '6'].includes(certId)) {
        const fc = FALLBACK_CERTIFICATES.find(c => c.id === certId);
        if (fc) {
          const { id, ...data } = fc;
          await setDoc(doc(db, 'certificates', certId), data, { merge: true });
        }
      }

      let downloadImageUrl = '';
      let downloadPdfUrl = '';

      if (isPdf) {
        // 1. Scan and extract Title, Issuer, Date from PDF text layer
        const metadata = await extractPdfCertificateMetadata(file);

        setUploading(prev => ({ ...prev, [certId]: 'Rendering preview...' }));

        // 2. Render Page 1 to high-resolution WebP Blob client-side
        const { blob: imageBlob } = await renderPdfFirstPageToImage(file, 2.0);

        setUploading(prev => ({ ...prev, [certId]: 'Saving to Firebase...' }));

        // 3. Upload rendered thumbnail image
        const imageStorageRef = ref(storage, `certificates/${certId}/thumb-${Date.now()}.webp`);
        await uploadBytes(imageStorageRef, imageBlob);
        downloadImageUrl = await getDownloadURL(imageStorageRef);

        // 4. Upload original authentic PDF document
        const pdfStorageRef = ref(storage, `certificates/${certId}/doc-${Date.now()}-${file.name}`);
        await uploadBytes(pdfStorageRef, file);
        downloadPdfUrl = await getDownloadURL(pdfStorageRef);

        const currentCert = certificates.find(c => c.id === certId);
        const updatePayload = {
          imageUrl: downloadImageUrl,
          pdfUrl: downloadPdfUrl,
          ...(metadata.title ? { title: metadata.title } : {}),
          ...(metadata.issuer ? { issuer: metadata.issuer } : {}),
          ...(metadata.date ? { date: metadata.date } : {}),
          ...(currentCert && !currentCert.verifyUrl ? { verifyUrl: downloadPdfUrl } : {})
        };

        await updateDoc(doc(db, 'certificates', certId), updatePayload);

        setCertificates(prev => prev.map(c =>
          c.id === certId ? { ...c, ...updatePayload } : c
        ));
      } else {
        // Regular image upload
        const storageRef = ref(storage, `certificates/${certId}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        downloadImageUrl = await getDownloadURL(storageRef);

        await updateDoc(doc(db, 'certificates', certId), {
          imageUrl: downloadImageUrl
        });

        setCertificates(prev => prev.map(c =>
          c.id === certId ? { ...c, imageUrl: downloadImageUrl } : c
        ));
      }
    } catch (err) {
      console.error('Error uploading document/image:', err);
      alert('Upload failed: ' + (err.message || 'Check storage connection.'));
    } finally {
      setUploading(prev => ({ ...prev, [certId]: false }));
    }
  };

  const handleRemoveDocument = async (certId, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Remove document / image for this certificate?')) return;
    try {
      await updateDoc(doc(db, 'certificates', certId), {
        imageUrl: '',
        pdfUrl: ''
      });
      setCertificates(prev => prev.map(c =>
        c.id === certId ? { ...c, imageUrl: '', pdfUrl: '' } : c
      ));
    } catch (err) {
      console.error('Error removing certificate document:', err);
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
    <div className="w-full flex flex-col justify-center select-none py-3 sm:py-5">
      {/* ─── Clean Header Bar ─── */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm">
            <Award size={13} className="text-cyan-400" />
            <span>Certifications</span>
          </div>
          <span className="text-xs font-mono text-slate-300 bg-white/[0.05] border border-white/[0.1] px-2.5 py-0.5 rounded-full font-medium">
            {String(activeIndex + 1).padStart(2, '0')} / {String(certificates.length).padStart(2, '0')}
          </span>
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

      {/* ─── 3D PERSPECTIVE STAGE WITH FLANKING STAGE NAVIGATION ARROWS ─── */}
      <div 
        className="w-full relative h-[360px] sm:h-[400px] md:h-[430px] lg:h-[450px] flex items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        {/* Floating Left Stage Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-1 sm:left-3 md:left-6 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-950/80 border border-white/15 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/20 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          title="Previous Certificate"
        >
          <ChevronLeft size={22} />
        </button>

        {/* 3D Revolving Container */}
        <motion.div
          className="relative w-[320px] sm:w-[460px] md:w-[520px] lg:w-[560px] h-[270px] sm:h-[310px] md:h-[335px] lg:h-[350px] cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: 'preserve-3d',
            rotateY: rotation,
            z: -translateZ,
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
              handleUploadDocument={handleUploadDocument}
              handleRemoveDocument={handleRemoveDocument}
              onClickCard={handleSelectCard}
            />
          ))}
        </motion.div>

        {/* Floating Right Stage Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-1 sm:right-3 md:right-6 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-950/80 border border-white/15 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/20 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          title="Next Certificate"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ─── Interactive Bottom Indicator Strip ─── */}
      <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
        {certificates.map((_, i) => {
          const isCurrent = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectCard(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                isCurrent 
                  ? 'w-7 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Jump to certificate ${i + 1}`}
            />
          );
        })}
      </div>

      {/* ─── Navigation Legend Bar ─── */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-mono text-slate-400/90 text-center flex-wrap px-2">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[10px] text-slate-300">◄</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[10px] text-slate-300">►</kbd>
          <span>Drag or arrows to rotate</span>
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          <MousePointerClick size={12} className="text-cyan-400" />
          <span>Click card to bring to front</span>
        </span>
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
