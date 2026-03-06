# Gateway — Flujos, Message Patterns y Payloads para content-microservice

## Resumen

Este documento lista los flujos (eventos y RPC), los message patterns que usan los controllers del servicio `content-microservice`, ejemplos de payloads que el Gateway debe enviar/reenviar y una checklist para validar si el Gateway está preparado.

---

## Formato de Respuesta Unificado

Todas las respuestas RPC del microservicio están envueltas en un formato estándar mediante `RpcResponseInterceptor`:

```typescript
interface RpcResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
```

**Ejemplo de respuesta exitosa:**

```json
{
  "success": true,
  "data": { "id": "post-123", "title": "Mi post" },
  "message": "Operation successful"
}
```

**Ejemplo de respuesta con paginación:**

```json
{
  "success": true,
  "data": {
    "data": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "lastPage": 5,
      "limit": 20
    }
  },
  "message": "Operation successful"
}
```

---

## Formato de Errores RPC

Los errores se lanzan mediante `RpcException` con estructura consistente:

```typescript
interface RpcErrorPayload {
  statusCode: number;
  code: string;
  message: string;
}
```

**Ejemplo de error:**

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "El campo 'title' es requerido"
}
```

---

## Eventos (pub-sub) que el microservicio consume

### `auth.tokenGenerated`

- **Emisor:** Servicio de Auth cuando se genera/renueva un token.
- **Consumidores:** posts, events, event-reviews, post-reactions, saved-posts, event-attendance
- **Propósito:** Replicar referencia de usuario (Event-Carried State Transfer).
- **DTO:** `AuthTokenGeneratedDto`

```json
{
  "user": { "user_id": "123", "email": "jane@example.com", "name": "Jane" },
  "token": "eyJhbGci..."
}
```

### `events.reviewCreated`

- **Emisor:** Servicio que crea reviews.
- **Consumidor:** event-reviews consumer
- **DTO:** `CreateEventReviewDto`

```json
{ "event_id": "ev-123", "sql_user_id": "123", "rating": 5 }
```

---

## Paginación

Los endpoints `findAllPosts` y `findAllEvents` aceptan paginación:

```typescript
interface PaginationDto {
  page?: number;  // default: 1
  limit?: number; // default: 20
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}
```

---

## RPC / Message Patterns

### Posts

| Pattern        | Payload          | Descripción            |
| -------------- | ---------------- | ---------------------- |
| `createPost`   | `CreatePostDto`  | Crea un nuevo post     |
| `findAllPosts` | `PaginationDto?` | Lista posts paginados  |
| `findOnePost`  | `string` (id)    | Obtiene un post por ID |
| `updatePost`   | `UpdatePostDto`  | Actualiza un post      |
| `removePost`   | `string` (id)    | Elimina un post        |

**CreatePostDto:**

```json
{
  "sql_user_id": "123",
  "type": "image",
  "title": "Mi post",
  "content": "https://...",
  "description": "...",
  "provider": "..."
}
```

> **Nota:** `type` solo acepta `"image"` o `"audio"`.

**UpdatePostDto:**

```json
{
  "id": "post-123",
  "title": "Nuevo título",
  "content": "...",
  "description": "..."
}
```

---

### Post Reactions

| Pattern               | Payload                 | Descripción          |
| --------------------- | ----------------------- | -------------------- |
| `createPostReaction`  | `CreatePostReactionDto` | Crea una reacción    |
| `findReactionsByPost` | `{ post_id: string }`   | Lista reacciones     |
| `removePostReaction`  | `{ id: string }`        | Elimina una reacción |

**CreatePostReactionDto:**

```json
{ "sql_user_id": "123", "post_id": "post-456", "type": "like" }
```

> **Nota:** `type` solo acepta `"like"`, `"love"`, `"fire"` o `"applause"`.

---

### Saved Posts

| Pattern                | Payload                   | Descripción           |
| ---------------------- | ------------------------- | --------------------- |
| `createSavedPost`      | `CreateSavedPostDto`      | Guarda un post        |
| `findSavedPostsByUser` | `{ sql_user_id: string }` | Lista posts guardados |
| `removeSavedPost`      | `{ id: string }`          | Elimina post guardado |

**CreateSavedPostDto:**

```json
{ "post_id": "507f1f77bcf86cd799439011", "sql_user_id": "123" }
```

> **Nota:** `post_id` debe ser un MongoID válido.

---

### Events

| Pattern         | Payload          | Descripción              |
| --------------- | ---------------- | ------------------------ |
| `createEvent`   | `CreateEventDto` | Crea un evento           |
| `findAllEvents` | `PaginationDto?` | Lista eventos paginados  |
| `findOneEvent`  | `string` (id)    | Obtiene un evento por ID |
| `updateEvent`   | `UpdateEventDto` | Actualiza un evento      |
| `removeEvent`   | `string` (id)    | Elimina un evento        |

**CreateEventDto:**

```json
{
  "sql_user_id": "123",
  "title": "Concierto",
  "description": "...",
  "event_date": "2026-03-15",
  "location": "Teatro Nacional"
}
```

---

### Event Attendance

| Pattern                  | Payload                    | Descripción            |
| ------------------------ | -------------------------- | ---------------------- |
| `createEventAttendance`  | `CreateEventAttendanceDto` | Registra asistencia    |
| `findAttendanceByEvent`  | `{ event_id: string }`     | Lista asistentes       |
| `findOneEventAttendance` | `{ id: string }`           | Obtiene una asistencia |
| `updateEventAttendance`  | `UpdateEventAttendanceDto` | Actualiza asistencia   |
| `removeEventAttendance`  | `{ id: string }`           | Elimina asistencia     |

**CreateEventAttendanceDto:**

```json
{ "event_id": "event-123", "sql_user_id": "123", "status": "confirmed" }
```

> **Nota:** `status` solo acepta `"confirmed"`, `"pending"` o `"cancelled"`.

---

### Event Reviews

| Pattern              | Payload                | Descripción        |
| -------------------- | ---------------------- | ------------------ |
| `createEventReview`  | `CreateEventReviewDto` | Crea una review    |
| `findReviewsByEvent` | `{ event_id: string }` | Lista reviews      |
| `findOneEventReview` | `{ id: string }`       | Obtiene una review |
| `updateEventReview`  | `UpdateEventReviewDto` | Actualiza review   |
| `removeEventReview`  | `{ id: string }`       | Elimina review     |

**CreateEventReviewDto:**

```json
{ "event_id": "event-123", "sql_user_id": "123", "rating": 5 }
```

---

## Checklist para el Gateway

### Conectividad

- [ ] Soporta RPC hacia RabbitMQ (queue: `riff_queue`)
- [ ] Soporta TCP hacia el microservicio (puerto via `TCP_PORT`)
- [ ] Puede enviar `MessagePattern` con los nombres listados

### Eventos

- [ ] Puede publicar `auth.tokenGenerated` con payload `{ user, token }`
- [ ] Preserva/propaga `correlationId` en metadata

### Validación de payloads

- [ ] `CreatePostDto.type` = `"image"` | `"audio"`
- [ ] `CreatePostReactionDto.type` = `"like"` | `"love"` | `"fire"` | `"applause"`
- [ ] `CreateEventAttendanceDto.status` = `"confirmed"` | `"pending"` | `"cancelled"`
- [ ] `UpdateXxxDto` siempre incluye `id` como string no vacío
- [ ] `CreateSavedPostDto.post_id` es MongoID válido

### Manejo de respuestas

- [ ] Procesa respuestas con formato `{ success, data, message }`
- [ ] Procesa respuestas paginadas con `{ data, meta }`
- [ ] Maneja errores RPC con formato `{ statusCode, code, message }`

---

## Flujo ECST (Event-Carried State Transfer)

```
┌─────────────┐  auth.tokenGenerated  ┌────────────────────┐
│ Auth Service│ ───────────────────►  │ content-microservice│
└─────────────┘                        │  ┌──────────────┐  │
                                       │  │ UserRef (DB) │  │
                                       │  └──────────────┘  │
                                       └────────────────────┘
                  createPost (RPC)              │
┌─────────────┐ ───────────────────►           │
│   Gateway   │                                 │
└─────────────┘ ◄───────────────────────────────┘
                  { success, data, message }
```

**Importante:** `createPost` requiere que `UserRef` exista antes de la creación.

---

## Mapeo HTTP → RPC

| HTTP   | Endpoint                 | Pattern                 | Payload                |
| ------ | ------------------------ | ----------------------- | ---------------------- |
| POST   | `/posts`                 | `createPost`            | body: `CreatePostDto`  |
| GET    | `/posts`                 | `findAllPosts`          | query: `page`, `limit` |
| GET    | `/posts/:id`             | `findOnePost`           | param: `id`            |
| PATCH  | `/posts/:id`             | `updatePost`            | body: `UpdatePostDto`  |
| DELETE | `/posts/:id`             | `removePost`            | param: `id`            |
| POST   | `/posts/:id/reactions`   | `createPostReaction`    | body                   |
| GET    | `/posts/:id/reactions`   | `findReactionsByPost`   | param                  |
| DELETE | `/reactions/:id`         | `removePostReaction`    | param                  |
| POST   | `/saved-posts`           | `createSavedPost`       | body                   |
| GET    | `/users/:id/saved-posts` | `findSavedPostsByUser`  | param                  |
| DELETE | `/saved-posts/:id`       | `removeSavedPost`       | param                  |
| POST   | `/events`                | `createEvent`           | body: `CreateEventDto` |
| GET    | `/events`                | `findAllEvents`         | query: `page`, `limit` |
| GET    | `/events/:id`            | `findOneEvent`          | param: `id`            |
| PATCH  | `/events/:id`            | `updateEvent`           | body: `UpdateEventDto` |
| DELETE | `/events/:id`            | `removeEvent`           | param: `id`            |
| POST   | `/events/:id/attendance` | `createEventAttendance` | body                   |
| GET    | `/events/:id/attendance` | `findAttendanceByEvent` | param                  |
| POST   | `/events/:id/reviews`    | `createEventReview`     | body                   |
| GET    | `/events/:id/reviews`    | `findReviewsByEvent`    | param                  |

---

## Ejemplo completo: Crear post

**1. Gateway recibe:**

```http
POST /posts
Content-Type: application/json

{
  "sql_user_id": "123",
  "type": "image",
  "title": "Mi foto"
}
```

**2. Gateway envía RPC:**

```javascript
broker.send('createPost', {
  sql_user_id: '123',
  type: 'image',
  title: 'Mi foto',
});
```

**3. Microservicio responde:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "sql_user_id": "123",
    "type": "image",
    "title": "Mi foto",
    "created_at": "2026-03-01T12:00:00Z"
  },
  "message": "Operation successful"
}
```

---

## Ejemplo: Listado paginado

**Request:**

```javascript
broker.send('findAllPosts', { page: 2, limit: 10 });
```

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [
      { "id": "...", "title": "Post 1" },
      { "id": "...", "title": "Post 2" }
    ],
    "meta": { "total": 50, "page": 2, "lastPage": 5, "limit": 10 }
  },
  "message": "Operation successful"
}
```

---

## Ejemplo: Error de validación

**Request inválido:**

```javascript
broker.send('createPost', { sql_user_id: '123', type: 'video', title: 'Test' });
```

**Response:**

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "type must be one of: image, audio"
}
```
