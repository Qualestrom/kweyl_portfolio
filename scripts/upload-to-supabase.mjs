import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env or environment variables
const envPath = path.resolve('.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) supabaseUrl = value.trim();
      if ((key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'VITE_SUPABASE_ANON_KEY') && !supabaseKey) supabaseKey = value.trim();
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file first.');
  console.log('Example:');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOi...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'portfolio-assets';

async function uploadFile(localPath, storagePath, contentType) {
  const fileBuffer = fs.readFileSync(localPath);
  console.log(`Uploading ${storagePath}...`);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Failed to upload ${storagePath}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return publicUrl;
}

async function main() {
  console.log('--- Starting Assets Upload to Supabase Storage ---');
  
  // Ensure bucket exists
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.warn('Notice listing buckets:', bError.message);
  } else {
    const found = buckets?.some(b => b.name === BUCKET);
    if (!found) {
      console.log(`Bucket ${BUCKET} not found. Creating bucket...`);
      await supabase.storage.createBucket(BUCKET, { public: true });
    }
  }

  const uploadedUrls = {};

  // 1. Projects screenshots
  const projectsDir = path.resolve('public/assets/recovered/projects');
  if (fs.existsSync(projectsDir)) {
    const files = fs.readdirSync(projectsDir);
    for (const file of files) {
      const fullPath = path.join(projectsDir, file);
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const cleanName = file.replace(/\s+/g, '_');
      const publicUrl = await uploadFile(fullPath, `projects/${cleanName}`, mime);
      if (publicUrl) {
        uploadedUrls[file] = publicUrl;
        uploadedUrls[cleanName] = publicUrl;
        console.log(`  -> URL: ${publicUrl}`);
      }
    }
  }

  // 2. Certificates
  const certsDir = path.resolve('public/assets/recovered/certificates');
  if (fs.existsSync(certsDir)) {
    const files = fs.readdirSync(certsDir);
    for (const file of files) {
      const fullPath = path.join(certsDir, file);
      const cleanName = file.replace(/\s+/g, '_');
      const publicUrl = await uploadFile(fullPath, `certificates/${cleanName}`, 'application/pdf');
      if (publicUrl) {
        uploadedUrls[file] = publicUrl;
        uploadedUrls[cleanName] = publicUrl;
        console.log(`  -> URL: ${publicUrl}`);
      }
    }
  }

  // 3. Resumes
  const resumeDir = path.resolve('public/assets/recovered/resumes');
  if (fs.existsSync(resumeDir)) {
    const files = fs.readdirSync(resumeDir);
    for (const file of files) {
      const fullPath = path.join(resumeDir, file);
      const cleanName = file.replace(/\s+/g, '_');
      const publicUrl = await uploadFile(fullPath, `resumes/${cleanName}`, 'application/pdf');
      if (publicUrl) {
        uploadedUrls[file] = publicUrl;
        uploadedUrls[cleanName] = publicUrl;
        console.log(`  -> URL: ${publicUrl}`);
      }
    }
  }

  // 4. Automatically sync URLs into Supabase Tables
  console.log('\n--- Syncing CDN URLs to Database Tables ---');
  
  // Stellar-Cryo CMS
  const stellarPhotos = [
    uploadedUrls['Screenshot_2026-09-06_112431.png'],
    uploadedUrls['Screenshot_2026-09-06_112550.png'],
    uploadedUrls['Screenshot_2026-09-06_112739.png']
  ].filter(Boolean);
  if (stellarPhotos.length > 0) {
    await supabase.from('projects').update({ photos: stellarPhotos }).eq('id', '4qZN2lGENZnbe2gBZtNy');
    console.log('  Updated Stellar-Cryo CMS photos in database.');
  }

  // CREOSIM-MECHA
  const creoPhotos = [
    uploadedUrls['Screenshot_2026-08-29_213630.png'],
    uploadedUrls['image_(1).png'],
    uploadedUrls['image_(2).png'],
    uploadedUrls['image.png']
  ].filter(Boolean);
  if (creoPhotos.length > 0) {
    await supabase.from('projects').update({ photos: creoPhotos }).eq('id', '5');
    console.log('  Updated CREOSIM-MECHA photos in database.');
  }

  // CRADLE
  const cradlePhotos = [
    uploadedUrls['Screenshot_2026-09-06_101759.png'],
    uploadedUrls['Screenshot_2026-09-06_101834.png']
  ].filter(Boolean);
  if (cradlePhotos.length > 0) {
    await supabase.from('projects').update({ photos: cradlePhotos }).eq('id', '8WwyyZQN51XRGUEiJiAC');
    console.log('  Updated CRADLE photos in database.');
  }

  // Certificates
  if (uploadedUrls['CCNA_Switching_Routing_Wireless_Essentials.pdf']) {
    await supabase.from('certificates').update({ pdfUrl: uploadedUrls['CCNA_Switching_Routing_Wireless_Essentials.pdf'] }).eq('id', '1');
    console.log('  Updated CCNA Certificate pdfUrl.');
  }
  if (uploadedUrls['Python_Essentials_1.pdf']) {
    await supabase.from('certificates').update({ pdfUrl: uploadedUrls['Python_Essentials_1.pdf'] }).eq('id', '2');
    console.log('  Updated Python Certificate pdfUrl.');
  }
  if (uploadedUrls['Introduction_to_IOT_and_Digital_Transformation.pdf']) {
    await supabase.from('certificates').update({ pdfUrl: uploadedUrls['Introduction_to_IOT_and_Digital_Transformation.pdf'] }).eq('id', '3');
    console.log('  Updated IoT Certificate pdfUrl.');
  }

  // Resume
  if (uploadedUrls['Lamera_Resume.pdf']) {
    const resumeUrl = uploadedUrls['Lamera_Resume.pdf'];
    const resumeData = {
      name: 'Lamera_Resume.pdf',
      size: '70.6 KB',
      fileType: 'application/pdf',
      fileUrl: resumeUrl,
      previewUrl: '',
      uploadedAt: new Date().toISOString()
    };
    await supabase.from('config').upsert({ id: 'resume', data: resumeData });
    console.log('  Updated active resume in database.');
  }

  console.log('\nAll assets uploaded and database synchronized with Supabase CDN successfully!');
}

main().catch(console.error);
