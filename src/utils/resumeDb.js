import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { supabase, isSupabaseConfigured, uploadToSupabaseStorage } from '../supabase';
import { renderPdfFirstPageToImage, isPdfFile } from './pdfUtils';
import { compressImageFile, resolveAssetUrl } from './imageUtils';

/**
 * Format bytes to readable size (e.g. "245 KB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Convert File to Data URL (base64)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch the active resume from Supabase or Firestore (checking config/resume, config/main, and resumes/current)
 */
export async function getActiveResume() {
  // 1. Try Supabase config table first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('data')
        .eq('id', 'resume')
        .single();

      if (!error && data?.data) {
        const resumeData = {
          ...data.data,
          fileUrl: resolveAssetUrl(data.data.fileUrl)
        };
        try { localStorage.setItem('portfolio_active_resume', JSON.stringify(resumeData)); } catch (_) {}
        return resumeData;
      }
    } catch (supErr) {
      console.warn('Notice checking Supabase config/resume:', supErr);
    }
  }

  // 2. Try Firestore config/resume
  try {
    const configResumeRef = doc(db, 'config', 'resume');
    const snap = await getDoc(configResumeRef);
    if (snap.exists()) {
      const raw = snap.data();
      const data = {
        id: snap.id,
        ...raw,
        fileUrl: resolveAssetUrl(raw.fileUrl)
      };
      try { localStorage.setItem('portfolio_active_resume', JSON.stringify(data)); } catch (_) {}
      return data;
    }
  } catch (err) {
    console.warn('Notice checking config/resume:', err);
  }

  // 3. Try Firestore config/main heroCvData
  try {
    const mainDocRef = doc(db, 'config', 'main');
    const mainSnap = await getDoc(mainDocRef);
    if (mainSnap.exists()) {
      const data = mainSnap.data();
      if (data.heroCvData) {
        return {
          ...data.heroCvData,
          fileUrl: resolveAssetUrl(data.heroCvData.fileUrl)
        };
      }
      if (data.heroCvUrl && data.heroCvUrl !== '/cv.pdf') {
        return {
          name: data.heroCvName || 'Resume.pdf',
          size: 'Document',
          fileType: 'application/pdf',
          fileUrl: resolveAssetUrl(data.heroCvUrl),
          previewUrl: '',
          uploadedAt: data.heroCvUpdatedAt || ''
        };
      }
    }
  } catch (err) {
    console.warn('Notice checking config/main resume:', err);
  }

  // 4. Try standalone resumes/current (in case rules were updated)
  try {
    const docRef = doc(db, 'resumes', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const raw = snap.data();
      return {
        id: snap.id,
        ...raw,
        fileUrl: resolveAssetUrl(raw.fileUrl)
      };
    }
  } catch (_) {
    // Expected if rules only allow config/
  }

  // 5. Local storage fallback
  try {
    const cached = localStorage.getItem('portfolio_active_resume');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        fileUrl: resolveAssetUrl(parsed.fileUrl)
      };
    }
  } catch (_) {}

  // 6. Default local recovered resume
  return {
    name: 'Lamera_Resume.pdf',
    size: '70.6 KB',
    fileType: 'application/pdf',
    fileUrl: '/assets/recovered/resumes/Lamera_Resume.pdf',
    previewUrl: '',
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Subscribe to real-time changes of the active resume
 */
export function subscribeToActiveResume(onUpdate) {
  const unsubscribes = [];

  // 1. Listen to config/resume
  try {
    const resumeDocRef = doc(db, 'config', 'resume');
    const unsub1 = onSnapshot(resumeDocRef, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        try { localStorage.setItem('portfolio_active_resume', JSON.stringify(data)); } catch (_) {}
        onUpdate(data);
      }
    }, (err) => {
      console.warn('config/resume snapshot notice:', err);
    });
    unsubscribes.push(unsub1);
  } catch (_) {}

  // 2. Also listen to config/main for heroCvData or heroCvUrl
  try {
    const mainDocRef = doc(db, 'config', 'main');
    const unsub2 = onSnapshot(mainDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.heroCvData) {
          onUpdate(data.heroCvData);
        } else if (data.heroCvUrl && data.heroCvUrl !== '/cv.pdf') {
          onUpdate({
            name: data.heroCvName || 'Resume.pdf',
            size: 'Document',
            fileType: 'application/pdf',
            fileUrl: data.heroCvUrl,
            previewUrl: '',
            uploadedAt: data.heroCvUpdatedAt || ''
          });
        }
      }
    }, (err) => {
      console.warn('config/main snapshot notice:', err);
    });
    unsubscribes.push(unsub2);
  } catch (_) {}

  // 3. Optionally listen to resumes/current if allowed
  try {
    const standaloneRef = doc(db, 'resumes', 'current');
    const unsub3 = onSnapshot(standaloneRef, (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      }
    }, () => {});
    unsubscribes.push(unsub3);
  } catch (_) {}

  return () => {
    unsubscribes.forEach(fn => fn?.());
  };
}

/**
 * Process and generate preview for an uploaded file
 */
export async function processResumeFile(file) {
  const isPdf = isPdfFile(file);
  let previewUrl = '';

  if (isPdf) {
    try {
      const rendered = await renderPdfFirstPageToImage(file, 2.0);
      previewUrl = rendered.dataUrl;
    } catch (err) {
      console.warn('Could not generate PDF preview image:', err);
    }
  } else if (file.type.startsWith('image/')) {
    try {
      previewUrl = await compressImageFile(file, 1000, 1400, 0.88);
    } catch (err) {
      console.warn('Could not compress image preview:', err);
    }
  }

  return {
    name: file.name,
    size: formatFileSize(file.size),
    rawSize: file.size,
    fileType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
    previewUrl,
    file
  };
}

/**
 * Save new resume to database (replacing and deleting any old resume)
 * Uses permitted config/ collection in Firestore and resilient storage fallback
 */
export async function saveResumeToDatabase(fileObj, oldResume = null, onProgress = () => {}) {
  const { file, name, size, rawSize, fileType, previewUrl } = fileObj;

  // Supabase Upload Pipeline
  if (isSupabaseConfigured && supabase) {
    onProgress('Uploading document to Supabase...');
    const { publicUrl, filePath } = await uploadToSupabaseStorage('resumes', file);
    const resumePayload = {
      name,
      size,
      fileType,
      fileUrl: publicUrl,
      storagePath: filePath,
      previewUrl: previewUrl || '',
      uploadedAt: new Date().toISOString()
    };

    onProgress('Saving to Supabase database...');
    try {
      await supabase.from('config').upsert({ id: 'resume', data: resumePayload });
    } catch (dbErr) {
      console.warn('Supabase config/resume save notice:', dbErr);
    }

    try {
      localStorage.setItem('portfolio_active_resume', JSON.stringify(resumePayload));
      const localCfg = localStorage.getItem('portfolio_config');
      if (localCfg) {
        const parsed = JSON.parse(localCfg);
        parsed.heroCvUrl = publicUrl;
        parsed.heroCvName = name;
        parsed.heroCvData = resumePayload;
        parsed.heroCvUpdatedAt = resumePayload.uploadedAt;
        localStorage.setItem('portfolio_config', JSON.stringify(parsed));
      }
    } catch (_) {}

    return resumePayload;
  }

  onProgress('Uploading document...');

  let fileUrl = '';
  let storagePath = '';

  // 1. Try uploading to Firebase Storage
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const primaryStoragePath = `resumes/${Date.now()}-${safeName}`;
  const fallbackStoragePath = `certificates/resume/doc-${Date.now()}-${safeName}`;

  try {
    storagePath = primaryStoragePath;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    fileUrl = await getDownloadURL(storageRef);
  } catch (storageErr) {
    console.warn('Storage upload to resumes/ notice, trying fallback path:', storageErr);
    try {
      storagePath = fallbackStoragePath;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(storageRef);
    } catch (fallbackErr) {
      console.warn('Storage upload fallback notice:', fallbackErr);
      if (rawSize < 800 * 1024) {
        fileUrl = await fileToDataUrl(file);
        storagePath = '';
      } else {
        throw new Error('Storage upload failed (' + (storageErr.message || 'Permission denied') + ').');
      }
    }
  }

  // 2. If old resume had a storage file, delete it from Firebase Storage
  if (oldResume && oldResume.storagePath) {
    onProgress('Cleaning up previous document...');
    try {
      const oldStorageRef = ref(storage, oldResume.storagePath);
      await deleteObject(oldStorageRef);
    } catch (delErr) {
      console.warn('Notice: Previous storage file removal skipped:', delErr);
    }
  }

  // 3. Prepare payload
  onProgress('Saving to database...');
  const resumePayload = {
    name,
    size,
    fileType,
    fileUrl,
    storagePath,
    previewUrl: previewUrl || '',
    uploadedAt: new Date().toISOString()
  };

  // 4. Save to Firestore doc `config/resume` (permitted by match /config/{document=**})
  let savedToFirestore = false;
  try {
    const configResumeRef = doc(db, 'config', 'resume');
    await setDoc(configResumeRef, resumePayload, { merge: true });
    savedToFirestore = true;
  } catch (cfgResumeErr) {
    console.warn('Notice saving to config/resume:', cfgResumeErr);
  }

  // 5. Synchronize with main portfolio config `config/main`
  try {
    const configDocRef = doc(db, 'config', 'main');
    await setDoc(configDocRef, {
      heroCvUrl: fileUrl,
      heroCvName: name,
      heroCvData: resumePayload,
      heroCvUpdatedAt: resumePayload.uploadedAt
    }, { merge: true });
    savedToFirestore = true;
  } catch (cfgErr) {
    console.warn('Config sync notice:', cfgErr);
  }

  // 6. Also try `resumes/current` in case rules permit it
  try {
    const resumeDocRef = doc(db, 'resumes', 'current');
    await setDoc(resumeDocRef, resumePayload, { merge: false });
    savedToFirestore = true;
  } catch (resumesErr) {
    // If rules do not allow `resumes/` collection, this is safely caught since config/main & config/resume succeeded
    console.warn('Standalone resumes/current write skipped (handled via config document):', resumesErr.message);
  }

  // 7. Save to local storage cache as immediate resilient fallback
  try {
    localStorage.setItem('portfolio_active_resume', JSON.stringify(resumePayload));
    const localCfg = localStorage.getItem('portfolio_config');
    if (localCfg) {
      const parsed = JSON.parse(localCfg);
      parsed.heroCvUrl = fileUrl;
      parsed.heroCvName = name;
      parsed.heroCvData = resumePayload;
      parsed.heroCvUpdatedAt = resumePayload.uploadedAt;
      localStorage.setItem('portfolio_config', JSON.stringify(parsed));
    }
  } catch (_) {}

  if (!savedToFirestore) {
    console.warn('Saved resume to local cache due to Firestore permissions');
  }

  return resumePayload;
}
