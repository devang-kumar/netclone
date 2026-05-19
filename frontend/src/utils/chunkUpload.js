import axios from 'axios';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const MAX_RETRIES = 3;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Chunked upload for large files ────────────────────────────────────────
export const uploadFileInChunks = async (file, folder, onProgress) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Chunked upload: ${file.name} | ${(file.size / 1024 / 1024).toFixed(2)} MB | ${totalChunks} chunks`);

  // ── Step 1: Send all chunks (each responds immediately) ──────────────────
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = new Blob([file.slice(start, end)], { type: file.type });

    let retries = 0;
    let success = false;

    while (!success && retries < MAX_RETRIES) {
      try {
        const formData = new FormData();
        formData.append('chunk', chunkBlob, `chunk-${chunkIndex}.part`);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileId', fileId);
        formData.append('fileName', file.name);
        formData.append('fileType', file.type);
        formData.append('folder', folder);

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunkBlob.size / 1024 / 1024).toFixed(2)} MB)${retries > 0 ? ` retry ${retries}` : ''}`);

        const res = await axios.post('/api/admin/upload-chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // 1 min per chunk (they respond immediately now)
        });

        if (!res.data.success) throw new Error(res.data.message || 'Chunk rejected');

        // Progress: 0–95% while sending chunks
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 95);
        if (onProgress) onProgress(progress);

        success = true;
      } catch (err) {
        retries++;
        console.error(`Chunk ${chunkIndex + 1} attempt ${retries} failed:`, err.message);
        if (retries >= MAX_RETRIES) {
          throw new Error(`Chunk ${chunkIndex + 1}/${totalChunks} failed after ${MAX_RETRIES} retries: ${err.message}`);
        }
        await delay(1000 * retries);
      }
    }
  }

  // ── Step 2: Finalize — assemble + upload to Cloudinary ───────────────────
  console.log('All chunks sent. Finalizing upload to Cloudinary...');
  if (onProgress) onProgress(97); // show "almost done"

  const finalizeRes = await axios.post(
    '/api/admin/upload-finalize',
    { fileId },
    { timeout: 1800000 } // 30 minutes — Cloudinary can be slow for large videos
  );

  if (!finalizeRes.data.success) {
    throw new Error(finalizeRes.data.message || 'Finalize failed');
  }

  if (onProgress) onProgress(100);
  console.log('Upload finalized:', finalizeRes.data.data.url);

  return finalizeRes.data;
};

// ─── Smart upload: direct for small files, chunked for large ───────────────
export const uploadToCloudinary = async (file, folder, onProgress) => {
  console.log(`Upload: ${file.name} | ${(file.size / 1024 / 1024).toFixed(2)} MB`);

  if (file.size < 10 * 1024 * 1024) {
    // Small file — direct upload
    console.log('Direct upload (small file)');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await axios.post('/api/admin/upload-cloudinary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      }
    });

    return res.data;
  } else {
    // Large file — chunked upload
    console.log('Chunked upload (large file)');
    return await uploadFileInChunks(file, folder, onProgress);
  }
};
