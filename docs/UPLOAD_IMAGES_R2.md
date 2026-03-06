# Implementación de Subida de Imágenes a R2

## 📋 Descripción

Sistema de subida y procesamiento de imágenes que utiliza Cloudflare R2 como almacenamiento. Las imágenes se optimizan automáticamente, se convierten a WebP y se redimensionan antes de subirlas.

## 🚀 Características

- ✅ **Procesamiento automático de imágenes** con Sharp
- ✅ **Conversión a WebP** para optimización de tamaño
- ✅ **Redimensionamiento inteligente** (máx 1920x1080)
- ✅ **Validación de archivos** (tipo y tamaño)
- ✅ **Subida a Cloudflare R2**
- ✅ **Integrado en endpoints existentes** (sin nuevos endpoints)
- ✅ **Manejo de errores robusto**
- ✅ **Logging detallado**

## 📦 Dependencias Instaladas

```bash
npm install multer sharp @types/multer
```

## 🏗️ Arquitectura

### Servicios Creados

1. **ImageProcessorService** (`src/utils/services/image-processor.service.ts`)
   - Procesa y optimiza imágenes
   - Convierte a WebP
   - Redimensiona según parámetros
   - Valida archivos

2. **UploadImageService** (`src/posts/services/uploadImage.service.ts`)
   - Maneja la subida de imágenes de posts
   - Folder: `posts/`

3. **UploadEventImageService** (`src/events/services/uploadEventImage.service.ts`)
   - Maneja la subida de imágenes de eventos
   - Folder: `events/`

### Integración con Endpoints Existentes

Los servicios están disponibles pero **ya existen funciones integradas** en los controladores TCP:

- **Posts**: El `MessagePattern('createPost')` ya maneja data URLs en el campo `content`
- **Events**: El `MessagePattern('createEvent')` puede usar los servicios para `coverImageUrl`

**Los endpoints que usarás son los que ya existen:**

### Posts
```
POST   /posts           - Crear nuevo post (con imagen)
GET    /posts           - Listar todos los posts
GET    /posts/:id       - Obtener post por ID
PATCH  /posts/:id       - Actualizar contenido del post
DELETE /posts/:id       - Eliminar post
```

### Events
```
POST   /events          - Crear nuevo evento (con imagen)
GET    /events          - Listar todos los eventos
GET    /events/:id      - Obtener evento por ID
PATCH  /events/:id      - Actualizar información del evento
DELETE /events/:id      - Eliminar evento
```

## 🔧 Configuración

### Variables de Entorno (ya configuradas en docker-compose.yml)

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<tu-access-key>
R2_SECRET_KEY=<tu-secret-key>
R2_BUCKET=<tu-bucket>
R2_PUBLIC_URL=<tu-dominio-publico>
```

## 📝 Uso desde el Frontend

### Opción 1: Enviar Data URL (Base64) - **RECOMENDADO**

El backend ya acepta data URLs y las procesa automáticamente con los nuevos servicios de optimización.

```typescript
// Convertir archivo a base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Para posts
const imageBase64 = await fileToBase64(fileInput.files[0]);

const postData = {
  sql_user_id: "user-123",
  type: "image",
  title: "Mi post",
  description: "Descripción",
  content: imageBase64, // data:image/jpeg;base64,/9j/4AAQ...
};

// Enviar via TCP al gateway
await fetch('http://localhost:4000/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(postData)
});
```

### Opción 2: URL pública (si ya está subida)

```typescript
const postData = {
  sql_user_id: "user-123",
  type: "image",
  title: "Mi post",
  description: "Descripción",
  content: "https://tu-dominio.r2.dev/posts/image-123.webp",
};
```

## ⚙️ Parámetros de Procesamiento

### Posts
- **Carpeta**: `posts/`
- **Máx ancho**: 1920px
- **Máx alto**: 1080px
- **Calidad**: 85%
- **Formato**: WebP

### Eventos
- **Carpeta**: `events/`
- **Máx ancho**: 1920px
- **Máx alto**: 1080px
- **Calidad**: 85%
- **Formato**: WebP

## 🚫 Validaciones

### Tipos de archivo permitidos (en data URLs):
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

### Tamaño máximo:
- **10 MB** antes de la conversión

## 🔄 Flujo Completo

```
1. Frontend → convierte imagen a base64
2. Frontend → envía POST al endpoint existente con data URL
3. Backend → detecta data URL
4. ImageProcessorService → procesa y optimiza
5. StorageService → sube a R2
6. Backend → guarda en MongoDB con URL pública
7. ← Retorna post/evento creado con imagen optimizada
```

## 📂 Archivos Modificados/Creados

```
src/
├── utils/
│   └── services/
│       └── image-processor.service.ts (nuevo)
├── posts/
│   ├── services/
│   │   └── uploadImage.service.ts (nuevo)
│   └── posts.module.ts (actualizado - agregado ImageProcessorService)
└── events/
    ├── services/
    │   └── uploadEventImage.service.ts (nuevo)
    └── events.module.ts (actualizado - agregado ImageProcessorService)
```

## ✅ Ventajas de este Enfoque

1. **Sin nuevos endpoints** - Usa la arquitectura TCP existente
2. **Backend controla la optimización** - Reduce carga en el cliente
3. **Seguridad** - El frontend no necesita credenciales de R2
4. **Consistencia** - Todas las imágenes tienen el mismo formato y calidad
5. **Validación centralizada** - Tipo, tamaño y formato
6. **Logging** - Trazabilidad completa
7. **Compatible con flujo existente** - No rompe código anterior

## 🐳 Docker y DNS

La configuración DNS en Docker (`daemon.json`) permite que los contenedores resuelvan correctamente los nombres de Cloudflare R2:

```json
{
  "dns": ["1.1.1.1", "8.8.8.8"]
}
```

## 📝 Notas Importantes

1. **Las imágenes data URL se procesan automáticamente** en el flujo de creación
2. **El código existente de `saveImageToR2` sigue funcionando** pero ahora usa Sharp para optimización
3. **Las imágenes se convierten siempre a WebP** para optimización
4. **El redimensionamiento mantiene el aspect ratio** (fit: 'inside')
5. **No se requieren cambios en el frontend** si ya envías data URLs

## 🔍 Troubleshooting

### Error: "Failed to upload image"
- Verifica las credenciales de R2 en `.env`
- Confirma que el bucket existe
- Revisa los logs del contenedor: `docker logs riff_content_ms`

### Error: "Invalid image type"
- Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)
- Verifica el formato del data URL

### Error: "Image too large"
- El archivo original debe ser menor a 10MB
- Usa compresión en el frontend si es necesario

## 🎯 Próximos Pasos

Los servicios están listos para ser usados. Si necesitas:
- ✨ **Endpoints HTTP separados para upload** (para evitar data URLs grandes)
- 🖼️ **Múltiples tamaños** (thumbnails, medium, large)
- 🔐 **Autenticación adicional**
- 📊 **Límites por usuario**

Avísame y puedo implementarlo.

