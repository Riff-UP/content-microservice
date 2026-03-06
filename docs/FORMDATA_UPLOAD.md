# Endpoints HTTP para Subida de Imágenes con FormData

## 🎯 Endpoints Actualizados

Los endpoints de creación **ahora aceptan FormData** directamente. No se crearon nuevos endpoints.

### 1. Crear Post con Imagen
```
POST http://localhost:3004/posts
Content-Type: multipart/form-data
```

**Campos del FormData:**
- `image` (File, opcional) - Archivo de imagen
- `sql_user_id` (string, requerido)
- `type` (string, opcional) - "image" o "audio", default: "image"
- `title` (string, requerido)
- `description` (string, opcional)
- `content` (string, opcional) - URL si no se envía imagen
- `provider` (string, opcional)

**Respuesta:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "sql_user_id": "user-123",
  "type": "image",
  "title": "Mi post",
  "description": "Descripción",
  "content": "https://tu-r2.dev/posts/imagen_1234567890_abc123.webp",
  "created_at": "2026-03-04T10:00:00.000Z"
}
```

### 2. Crear Evento con Imagen
```
POST http://localhost:3004/events
Content-Type: multipart/form-data
```

**Campos del FormData:**
- `image` (File, opcional) - Archivo de imagen
- `sql_user_id` (string, requerido)
- `title` (string, requerido)
- `description` (string, requerido)
- `event_date` (string, requerido) - ISO 8601 date
- `location` (string, requerido)
- `coverImageUrl` (string, opcional) - URL si no se envía imagen

**Respuesta:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "sql_user_id": "user-123",
  "title": "Mi evento",
  "description": "Descripción del evento",
  "event_date": "2026-04-01T18:00:00.000Z",
  "location": "Ciudad de México",
  "coverImageUrl": "https://tu-r2.dev/events/imagen_1234567890_xyz789.webp",
  "created_at": "2026-03-04T10:00:00.000Z"
}
```

## 📝 Uso desde el Frontend

### Opción 1: Enviar FormData con archivo (RECOMENDADO)

#### JavaScript/TypeScript:

```typescript
// Crear post con imagen
const createPostWithImage = async (file: File, postData: any) => {
  const formData = new FormData();
  formData.append('image', file); // Archivo de imagen
  formData.append('sql_user_id', postData.sql_user_id);
  formData.append('type', 'image');
  formData.append('title', postData.title);
  if (postData.description) {
    formData.append('description', postData.description);
  }
  
  const response = await fetch('http://localhost:3004/posts', {
    method: 'POST',
    body: formData,
    // NO incluyas Content-Type, el browser lo configura automáticamente
  });
  
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  
  return await response.json();
};

// Crear evento con imagen
const createEventWithImage = async (file: File, eventData: any) => {
  const formData = new FormData();
  formData.append('image', file); // Archivo de imagen
  formData.append('sql_user_id', eventData.sql_user_id);
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('event_date', eventData.event_date);
  formData.append('location', eventData.location);
  
  const response = await fetch('http://localhost:3004/events', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  
  return await response.json();
};

// Uso:
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const post = await createPostWithImage(file, {
  sql_user_id: 'user-123',
  title: 'Mi post con imagen',
  description: 'Descripción opcional'
});

console.log('Post creado:', post);
console.log('Imagen en:', post.content);
```

#### React Example:

```tsx
import { useState } from 'react';

function CreatePostForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sql_user_id', 'user-123'); // Obtener del contexto/auth
      formData.append('type', 'image');
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      
      const response = await fetch('http://localhost:3004/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const post = await response.json();
      console.log('Post created:', post);
      alert('Post creado exitosamente!');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Imagen:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Descripción:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <button type="submit" disabled={!file || !title || uploading}>
        {uploading ? 'Creando...' : 'Crear Post'}
      </button>
    </form>
  );
}
```

### Opción 2: Enviar JSON sin archivo (mantiene compatibilidad)

Puedes seguir enviando JSON con URL o data URL:

```typescript
// JSON con URL de imagen
await fetch('http://localhost:3004/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql_user_id: "user-123",
    type: "image",
    title: "Mi post",
    content: "https://tu-r2.dev/posts/imagen.webp"
  })
});

// O con data URL (base64)
await fetch('http://localhost:3004/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql_user_id: "user-123",
    type: "image",
    title: "Mi post",
    content: "data:image/jpeg;base64,/9j/4AAQ..."
  })
});
```

## 🧪 Pruebas con cURL

### Crear post con imagen:

```bash
curl -X POST http://localhost:3004/posts \
  -F "image=@/path/to/image.jpg" \
  -F "sql_user_id=user-123" \
  -F "type=image" \
  -F "title=Mi post con imagen" \
  -F "description=Descripción opcional"
```

### Crear evento con imagen:

```bash
curl -X POST http://localhost:3004/events \
  -F "image=@/path/to/image.jpg" \
  -F "sql_user_id=user-123" \
  -F "title=Mi evento" \
  -F "description=Descripción del evento" \
  -F "event_date=2026-04-01T18:00:00.000Z" \
  -F "location=Ciudad de México"
```

## ✅ Validaciones

- **Tipos permitidos:** JPEG, JPG, PNG, WebP, GIF
- **Tamaño máximo:** 10 MB
- **Campo de imagen:** `image` (opcional)
- **Si envías archivo:** Se procesa automáticamente
- **Si no envías archivo:** Puedes enviar URL en `content` o `coverImageUrl`
- **Procesamiento automático:**
  - Conversión a WebP
  - Redimensionamiento (máx 1920x1080)
  - Compresión (calidad 85%)
  - Subida a R2

## 🎯 Ventajas

1. ✅ **Un solo endpoint** - No necesitas endpoints separados para upload
2. ✅ **Más eficiente** - Todo en una sola petición
3. ✅ **Menos código en frontend** - No necesitas dos llamadas
4. ✅ **Retrocompatible** - Sigue aceptando JSON con URLs
5. ✅ **FormData estándar** - Compatible con cualquier framework

## 🔄 Flujo Completo

```
Frontend                     Backend (POST /posts)
   │                                │
   │─── FormData ──────────────────>│
   │    ├─ image (File)             │
   │    ├─ sql_user_id              │
   │    ├─ type                     │
   │    ├─ title                    │
   │    └─ description              │
   │                                │
   │                         FileInterceptor
   │                                │
   │                         ImageProcessor
   │                         ├─ Validate
   │                         ├─ Resize
   │                         ├─ Convert to WebP
   │                         └─ Compress
   │                                │
   │                         StorageService
   │                         └─ Upload to R2
   │                                │
   │                         CreatePostService
   │                         └─ Save to MongoDB
   │                                │
   │<─── { post with image URL } ───│
```

## 📦 Endpoints Disponibles

| Método | Endpoint | Acepta | Descripción |
|--------|----------|--------|-------------|
| POST | `/posts` | FormData o JSON | Crea post con/sin imagen |
| POST | `/events` | FormData o JSON | Crea evento con/sin imagen |
| GET | `/posts` | - | Lista todos los posts |
| GET | `/posts/:id` | - | Obtiene post por ID |
| PATCH | `/posts/:id` | JSON | Actualiza post |
| DELETE | `/posts/:id` | - | Elimina post |
| GET | `/events` | - | Lista todos los eventos |
| GET | `/events/:id` | - | Obtiene evento por ID |
| PATCH | `/events/:id` | JSON | Actualiza evento |
| DELETE | `/events/:id` | - | Elimina evento |

## 🚀 Estado

✅ **IMPLEMENTACIÓN COMPLETA**

Los endpoints HTTP de creación (`POST /posts` y `POST /events`) **ahora aceptan FormData** directamente con archivos de imagen. El backend procesa, optimiza y sube automáticamente a R2.

**No se crearon endpoints nuevos**, solo se adaptaron los existentes.

## 🎯 Nuevos Endpoints Creados

### 1. Subir Imagen de Post
```
POST http://localhost:3004/upload/post-image
Content-Type: multipart/form-data
```

**Campo del FormData:** `image`

**Respuesta:**
```json
{
  "success": true,
  "url": "https://tu-r2.dev/posts/imagen_1234567890_abc123.webp",
  "width": 1920,
  "height": 1080,
  "format": "webp",
  "size": 245680
}
```

### 2. Subir Imagen de Evento
```
POST http://localhost:3004/upload/event-image
Content-Type: multipart/form-data
```

**Campo del FormData:** `image`

**Respuesta:**
```json
{
  "success": true,
  "url": "https://tu-r2.dev/events/imagen_1234567890_xyz789.webp",
  "width": 1920,
  "height": 1080,
  "format": "webp",
  "size": 312450
}
```

## 📝 Uso desde el Frontend

### Opción 1: Subir primero, luego crear post/evento (RECOMENDADO)

#### JavaScript/TypeScript:

```typescript
// 1. Subir la imagen primero
const uploadImage = async (file: File, type: 'post' | 'event') => {
  const formData = new FormData();
  formData.append('image', file);
  
  const endpoint = type === 'post' 
    ? 'http://localhost:3004/upload/post-image'
    : 'http://localhost:3004/upload/event-image';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    // NO incluyas Content-Type, el browser lo configura automáticamente con boundary
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  
  const result = await response.json();
  return result.url; // URL de R2
};

// 2. Crear el post con la URL
const createPost = async (imageFile: File) => {
  // Primero sube la imagen
  const imageUrl = await uploadImage(imageFile, 'post');
  
  // Luego crea el post con la URL
  const response = await fetch('http://localhost:4000/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <token>'
    },
    body: JSON.stringify({
      sql_user_id: "user-123",
      type: "image",
      title: "Mi post con imagen",
      description: "Descripción",
      content: imageUrl // URL de R2
    })
  });
  
  return await response.json();
};

// 3. Crear evento con imagen
const createEvent = async (imageFile: File) => {
  // Primero sube la imagen
  const imageUrl = await uploadImage(imageFile, 'event');
  
  // Luego crea el evento con la URL
  const response = await fetch('http://localhost:4000/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <token>'
    },
    body: JSON.stringify({
      sql_user_id: "user-123",
      title: "Mi evento",
      description: "Descripción del evento",
      event_date: "2026-04-01T18:00:00.000Z",
      location: "Ciudad de México",
      coverImageUrl: imageUrl // URL de R2
    })
  });
  
  return await response.json();
};

// Uso:
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Para posts
const post = await createPost(file);
console.log('Post creado:', post);

// Para eventos
const event = await createEvent(file);
console.log('Evento creado:', event);
```

#### React Example:

```tsx
import { useState } from 'react';

function UploadPostForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch('http://localhost:3004/upload/post-image', {
        method: 'POST',
        body: formData,
      });
      
      const { url } = await uploadResponse.json();
      
      // 2. Create post with URL
      const postResponse = await fetch('http://localhost:4000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql_user_id: 'user-123',
          type: 'image',
          title: 'My Post',
          content: url,
        }),
      });
      
      const post = await postResponse.json();
      console.log('Post created:', post);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### Opción 2: Seguir usando Data URLs (mantiene compatibilidad)

Los endpoints de posts y eventos **siguen aceptando data URLs** en base64:

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const imageBase64 = await fileToBase64(file);

// Crear post directamente
await fetch('http://localhost:4000/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql_user_id: "user-123",
    type: "image",
    title: "Mi post",
    content: imageBase64 // data:image/jpeg;base64,...
  })
});
```

## 🧪 Pruebas con cURL

### Subir imagen de post:

```bash
curl -X POST http://localhost:3004/upload/post-image \
  -F "image=@/path/to/image.jpg"
```

### Subir imagen de evento:

```bash
curl -X POST http://localhost:3004/upload/event-image \
  -F "image=@/path/to/image.jpg"
```

## ✅ Validaciones

- **Tipos permitidos:** JPEG, JPG, PNG, WebP, GIF
- **Tamaño máximo:** 10 MB
- **Campo requerido:** `image` en FormData
- **Procesamiento automático:**
  - Conversión a WebP
  - Redimensionamiento (máx 1920x1080)
  - Compresión (calidad 85%)
  - Subida a R2

## 🎯 Ventajas del Enfoque FormData

1. ✅ **No hay límite de tamaño en la URL** (data URLs pueden ser muy grandes)
2. ✅ **Más eficiente** - No hay conversión a base64
3. ✅ **Mejor experiencia de usuario** - Upload progress disponible
4. ✅ **Standard web** - FormData es el estándar para uploads
5. ✅ **Compatible con cualquier framework** - React, Vue, Angular, vanilla JS

## 🔄 Flujo Completo

```
Frontend                Backend (Upload)         Backend (Create)
   │                           │                        │
   │─── POST /upload/post-image                        │
   │    (FormData: image) ────>│                        │
   │                           │                        │
   │                           │ ImageProcessor         │
   │                           │ ├─ Validate           │
   │                           │ ├─ Resize             │
   │                           │ ├─ Convert to WebP    │
   │                           │ └─ Compress           │
   │                           │                        │
   │                           │ StorageService         │
   │                           │ └─ Upload to R2        │
   │                           │                        │
   │<─── { url: "https://..." }│                        │
   │                           │                        │
   │─── POST /posts ───────────────────────────────────>│
   │    { content: url }                               │
   │                                                    │
   │<─── { post with optimized image } ────────────────│
```

## 📦 Endpoints Disponibles

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/upload/post-image` | Sube imagen de post | FormData: `image` |
| POST | `/upload/event-image` | Sube imagen de evento | FormData: `image` |
| POST | `/posts` | Crea post (acepta URL o data URL) | JSON |
| POST | `/events` | Crea evento (acepta URL o data URL) | JSON |

## 🚀 Estado

✅ **IMPLEMENTACIÓN COMPLETA**

Los endpoints HTTP están listos para recibir FormData con archivos de imagen. El backend procesa, optimiza y sube automáticamente a R2.

