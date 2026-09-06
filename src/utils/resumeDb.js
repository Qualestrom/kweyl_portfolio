import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { renderPdfFirstPageToImage, isPdfFile } from './pdfUtils';
import { compressImageFile } from './imageUtils';

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
 * Fetch the active resume from Firestore
 */
export async function getActiveResume() {
  try {
    const docRef = doc(db, 'resumes', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn('Error fetching active resume from Firestore:', err);
    return null;
  }
}

/**
 * Subscribe to real-time changes of the active resume
 */
export function subscribeToActiveResume(onUpdate) {
  try {
    const docRef = doc(db, 'resumes', 'current');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        onUpdate(null);
      }
    }, (err) => {
      console.warn('Resume listener notice:', err);
    });
  } catch (_) {
    return () => {};
  }
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
 */
export async function saveResumeToDatabase(fileObj, oldResume = null, onProgress = () => {}) {
  const { file, name, size, rawSize, fileType, previewUrl } = fileObj;

  onProgress('Uploading document...');

  let fileUrl = '';
  let storagePath = '';

  // 1. Try uploading to Firebase Storage first
  try {
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    storagePath = `resumes/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    fileUrl = await getDownloadURL(storageRef);
  } catch (storageErr) {
    console.warn('Firebase Storage upload notice, falling back to database base64:', storageErr);
    // If file is under 800KB, store as data URL in Firestore document
    if (rawSize < 800 * 1024) {
      fileUrl = await fileToDataUrl(file);
      storagePath = '';
    } else {
      throw new Error('File exceeds database document limit. Firebase storage is required for files > 800KB.');
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

  // 3. Save new resume document to Firestore (overwriting doc 'resumes/current')
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

  const resumeDocRef = doc(db, 'resumes', 'current');
  await setDoc(resumeDocRef, resumePayload, { merge: false });

  // 4. Synchronize with main portfolio config
  try {
    const configDocRef = doc(db, 'config', 'main');
    await setDoc(configDocRef, {
      heroCvUrl: fileUrl,
      heroCvName: name,
      heroCvUpdatedAt: resumePayload.uploadedAt
    }, { merge: true });
  } catch (cfgErr) {
    console.warn('Config sync notice:', cfgErr);
  }

  return resumePayload;
}
