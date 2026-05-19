# Video Upload Fix - True Chunked Upload Implementation

## Problem
Large video files were timing out during upload, causing "Request Timeout" errors in the admin panel.

## Solution
Implemented a **true chunked upload system** that:
1. **Splits large files into 5MB chunks on the frontend**
2. **Uploads each chunk separately** to the backend
3. **Backend assembles chunks** and uploads complete file to Cloudinary
4. **Automatic selection**: Small files (<10MB) use direct upload, large files use chunked upload

## How It Works

### Upload Flow for Large Videos (>10MB):

```
Frontend:
1. Split video into 5MB chunks
2. Upload chunk 1 → Backend stores in memory
3. Upload chunk 2 → Backend stores in memory
4. Upload chunk 3 → Backend stores in memory
   ... continue for all chunks
5. Last chunk → Backend assembles all chunks
6. Backend uploads complete file to Cloudinary
7. Backend returns Cloudinary URL
8. Frontend saves episode with URL
```

### Upload Flow for Small Files (<10MB):
```
Frontend → Direct upload → Backend → Cloudinary → URL returned
```

## Changes Made

### Frontend Changes

#### `frontend/src/utils/chunkUpload.js`
- **`uploadFileInChunks()`**: Splits file into 5MB chunks and uploads sequentially
  - Creates unique fileId for tracking
  - Sends chunks with metadata (chunkIndex, totalChunks, fileName, fileType)
  - Tracks progress per chunk
  - Returns Cloudinary result when complete
  
- **`uploadToCloudinary()`**: Smart upload function
  - Files < 10MB: Direct upload (faster)
  - Files ≥ 10MB: Chunked upload (reliable)
  - Progress tracking for both methods

#### `frontend/src/pages/admin/AdminEpisodes.js`
- Uses `uploadToCloudinary()` for both thumbnail and video
- Automatic chunking for large videos
- Progress tracking: 10-30% (thumbnail), 30-90% (video), 90-100% (saving)

### Backend Changes

#### `backend/routes/upload.js`
- **POST `/api/admin/upload-cloudinary`**: Direct upload endpoint (for small files)
- **POST `/api/admin/upload-chunk`**: Chunked upload endpoint
  - Receives individual chunks
  - Stores chunks in memory (Map structure)
  - Tracks progress (receivedCount/totalChunks)
  - When all chunks received:
    - Assembles chunks into complete file
    - Uploads to Cloudinary
    - Returns URL and metadata
    - Cleans up memory

#### `backend/routes/admin.js`
- Episode creation accepts video URLs
- Episode updates handle both files and URLs
- Extracts Cloudinary publicId from URLs

## Technical Details

### Chunk Size
- **5MB per chunk** (configurable in `chunkUpload.js`)
- Example: 100MB video = 20 chunks
- Each chunk uploads independently with 2-minute timeout

### Memory Management
- Chunks stored in `Map()` structure on backend
- Automatically cleaned up after assembly
- **Note**: For production, consider using Redis or disk storage for very large files

### Progress Tracking
```javascript
// Frontend calculates progress per chunk
const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

// Example for 100MB video (20 chunks):
// Chunk 1 complete: 5% progress
// Chunk 10 complete: 50% progress
// Chunk 20 complete: 100% progress
```

### Error Handling
- Each chunk has individual error handling
- Failed chunk stops upload with clear error message
- Backend validates each chunk before storing
- Cloudinary upload errors are caught and reported

## Benefits

✅ **No Timeout Issues**: Each 5MB chunk uploads quickly  
✅ **Large File Support**: Can handle videos of any size  
✅ **Better Progress**: Real-time progress per chunk  
✅ **Reliable**: Failed chunks can be retried (future enhancement)  
✅ **Automatic**: Smart selection between direct/chunked upload  
✅ **Memory Efficient**: Chunks processed sequentially  

## Configuration

### Adjust Chunk Size
Edit `frontend/src/utils/chunkUpload.js`:
```javascript
const CHUNK_SIZE = 5 * 1024 * 1024; // Change to 10MB: 10 * 1024 * 1024
```

### Adjust Direct Upload Threshold
Edit `frontend/src/utils/chunkUpload.js`:
```javascript
if (file.size < 10 * 1024 * 1024) { // Change to 20MB: 20 * 1024 * 1024
```

### Backend Timeout Per Chunk
Edit `frontend/src/utils/chunkUpload.js`:
```javascript
timeout: 120000, // 2 minutes, change to 5 minutes: 300000
```

## Testing

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm start`
3. **Test Small File** (<10MB):
   - Should use direct upload
   - Check console: "Using direct upload for small file"
4. **Test Large File** (>10MB):
   - Should use chunked upload
   - Check console: "Using chunked upload for large file"
   - Watch progress update per chunk
   - Backend logs show chunk assembly

## Console Output Example

### Frontend Console:
```
Using chunked upload for large file
Starting chunked upload: video.mp4, Size: 150.00MB, Chunks: 30
Uploading chunk 1/30 (5.00MB)
Uploading chunk 2/30 (5.00MB)
...
Uploading chunk 30/30 (0.50MB)
Upload complete! {success: true, complete: true, data: {...}}
```

### Backend Console:
```
Received chunk 1/30 for file: video.mp4 (5.00MB)
Progress: 1/30 chunks received
Received chunk 2/30 for file: video.mp4 (5.00MB)
Progress: 2/30 chunks received
...
All chunks received for video.mp4, assembling and uploading to Cloudinary...
Assembled file size: 150.00MB
Starting Cloudinary upload for video.mp4 as video...
Upload complete for video.mp4: https://res.cloudinary.com/...
```

## Production Considerations

For production deployment, consider:

1. **Persistent Storage**: Use Redis or database instead of in-memory Map
2. **Chunk Retry**: Implement retry logic for failed chunks
3. **Cleanup Job**: Periodic cleanup of incomplete uploads
4. **Parallel Uploads**: Upload multiple chunks simultaneously (advanced)
5. **Resume Support**: Allow resuming interrupted uploads

## Environment Variables

Ensure these are set in `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
