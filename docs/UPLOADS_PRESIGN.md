# Frontend upload guide (content-ms)

This document explains how the frontend should upload images for the Content microservice. It covers two flows:

- Quick testing or small images: Data URL (base64) sent directly to `POST /posts` (works with the current backend).
- Production / large images: Presigned PUT to object storage (recommended). Note: presign support requires the backend to expose a presign endpoint; if not available, use the Data URL flow for testing.

## Option A — Data URL (quick, works now)

1. Convert the file to a Data URL in the browser:

```javascript
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
```

2. POST the Data URL to the backend:

Request: `POST /posts`

Headers: `Content-Type: application/json`

Body example:

```json
{
  "sql_user_id": "<user id>",
  "type": "image",
  "title": "My photo",
  "content": "data:image/jpeg;base64,/9j/4AAQ...",
  "description": "..."
}
```

Notes:

- Base64 increases payload size ~33%. Use only for small images (recommended <1–2MB).
- If you hit server limits (413), switch to presigned uploads.

## Option B — Presigned PUT (recommended for production)

High-level flow (requires backend presign support):

1. Frontend requests a presigned URL from the backend (e.g. `POST /uploads` with `{ filename, mime, size }`). Backend returns `{ uploadUrl, publicUrl, key, expiresIn }`.
2. Frontend uploads the file directly to `uploadUrl` using HTTP PUT with `Content-Type: <mime>` and the file as the body.
3. After successful PUT (2xx), frontend notifies the backend to complete (e.g. `POST /uploads/complete` with `{ sql_user_id, publicUrl, title, description }`).
4. Backend validates the object and creates the post.

Frontend example (concept):

```javascript
// 1) Request presign
const presignRes = await fetch('/uploads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    mime: file.type,
    size: file.size,
  }),
});
const { uploadUrl, publicUrl } = await presignRes.json();

// 2) PUT to storage
const putRes = await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});
if (!putRes.ok) throw new Error('Upload failed');

// 3) Notify backend to create post
const completeRes = await fetch('/uploads/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql_user_id: userId, publicUrl, title, description }),
});
const post = await completeRes.json();
```

Notes:

- Configure CORS on your storage bucket (allow PUT from your frontend origin) or use a CDN domain.
- Presigned URLs must be short-lived (e.g. 10 minutes) and signed by the backend.
- Backend should validate the uploaded object with a HEAD before creating the post.
- Note: the backend will NOT fetch arbitrary external URLs. The frontend must upload to storage (presigned PUT) and provide the `publicUrl`, or send a `data:` URL. Submitting a remote URL that points to another host is rejected.

## Size & performance

- For large files (>5–10MB) prefer presigned/multipart uploads or resumable uploads (S3 multipart / TUS).
- Perform client-side resizing/compression when possible.

## Error handling

- Implement retries for transient upload errors.
- If `complete` fails, backend-side cleanup may be required; coordinate with backend team.

## Quick testing tips

- Postman: convert image to base64 and paste as Data URL in `content` for `POST /posts`.
- cURL: `base64 -w0 image.jpg` to produce inline base64 for scripts.

If you want a sample React component implementing either flow, tell me and I will produce it.
