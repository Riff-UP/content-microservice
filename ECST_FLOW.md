# Event-Carried State Transfer (ECST) — Flujo de Notificaciones

Flujo completo para el sistema de notificaciones de Riff usando ECST.  
Ningún microservicio llama a otro en runtime. Todos se comunican vía RabbitMQ.

---

## Arquitectura general

```
┌──────────────┐     ┌──────────────┐     ┌────────────────────┐
│   Users-MS   │     │  Content-MS  │     │  Notifications-MS  │
│   (SQL)      │     │  (Mongo)     │     │  (Mongo)           │
│              │     │              │     │                    │
│ users        │     │ posts        │     │ notifications      │
│ user_follows │     │ events       │     │ follow_refs (ECST) │
│              │     │ ...          │     │ user_refs   (ECST) │
└──────┬───────┘     └──────┬───────┘     └────────────────────┘
       │                    │                       ▲
       │    RabbitMQ        │    RabbitMQ            │
       │   (riff_queue)     │   (riff_queue)         │
       └────────────────────┴───────────────────────┘
```

---

## Fase 1 — Réplica de followers (Users-MS → Notifications-MS)

Users-MS emite eventos cada vez que un usuario sigue o deja de seguir a otro.  
Notifications-MS los consume y mantiene una **réplica local** (`follow_refs`).

### `follow.created`

Emitido cuando un usuario sigue a un artista.

```json
{
  "follower_id": "sql_user_id del seguidor",
  "follower_email": "email del seguidor",
  "follower_name": "nombre del seguidor",
  "followed_id": "sql_user_id del artista seguido"
}
```

**Acción en Notifications-MS:**

```
follow_refs.upsert(
  { follower_id, followed_id },
  { follower_id, follower_email, follower_name, followed_id }
)
```

### `follow.removed`

Emitido cuando un usuario deja de seguir a un artista.

```json
{
  "follower_id": "sql_user_id del seguidor",
  "followed_id": "sql_user_id del artista"
}
```

**Acción en Notifications-MS:**

```
follow_refs.deleteOne({ follower_id, followed_id })
```

---

## Fase 2 — Emisión de contenido (Content-MS → Notifications-MS)

Content-MS emite eventos cuando se crea, actualiza o elimina contenido.  
**No incluye followers.** Solo envía `userId` del autor.

| Evento            | Trigger                |
| ----------------- | ---------------------- |
| `post.created`    | Se crea un post        |
| `event.created`   | Se crea un evento      |
| `event.updated`   | Se actualiza un evento |
| `event.cancelled` | Se elimina un evento   |

Payload de ejemplo (`post.created`):

```json
{
  "type": "new_post",
  "message": "New post: Mi foto",
  "userId": "artist1",
  "postId": "664a..."
}
```

> Ver [RMQ_EVENTS.md](RMQ_EVENTS.md) para todos los payloads.

---

## Fase 3 — Procesamiento en Notifications-MS

Cuando recibe un evento de Content-MS:

```
1. Buscar followers en réplica local:
   follow_refs.find({ followed_id: payload.userId })
   → [{ follower_id, follower_email, follower_name }, ...]

2. Por cada follower:
   a) INSERT en tabla notifications:
      {
        user_id_receiver: follower_id,
        type:             payload.type,
        message:          payload.message,
        created_at:       now()
      }

   b) Enviar email con Resend:
      Resend.send({
        to:      follower_email,
        subject: payload.message,
        html:    template(payload.type, payload.message)
      })
```

---

## Diagrama de secuencia completo

```
Users-MS                Content-MS              Notifications-MS
   │                        │                          │
   │                        │                          │
   │ ── FASE 1: Réplica de followers ──────────────────│
   │                        │                          │
   │ emit('follow.created', │                          │
   │  { follower_id,        │                          │
   │    follower_email,     │                          │
   │    follower_name,      │                          │
   │    followed_id })      │                          │
   │────────────────────────┼─────────────────────────►│
   │                        │                    upsert│
   │                        │                follow_ref│
   │                        │                          │
   │ emit('follow.removed', │                          │
   │  { follower_id,        │                          │
   │    followed_id })      │                          │
   │────────────────────────┼─────────────────────────►│
   │                        │                   delete │
   │                        │                follow_ref│
   │                        │                          │
   │                        │                          │
   │ ── FASE 2: Evento de contenido ──────────────────│
   │                        │                          │
   │                        │ emit('post.created', {   │
   │                        │   type, message,         │
   │                        │   userId, postId         │
   │                        │ })                       │
   │                        │─────────────────────────►│
   │                        │                          │
   │                        │                          │
   │ ── FASE 3: Notificación ─────────────────────────│
   │                        │                          │
   │                        │         follow_refs.find(│
   │                        │           followed_id:   │
   │                        │             userId)      │
   │                        │                          │
   │                        │         Para cada follower:
   │                        │           INSERT notif   │
   │                        │           Resend.send()  │
   │                        │                          │
```

---

## Independencia de microservicios

| MS               | Emite                              | Consume                         | Llama a otro MS en runtime |
| ---------------- | ---------------------------------- | ------------------------------- | -------------------------- |
| Users-MS         | `follow.created`, `follow.removed` | —                               | ❌ No                      |
| Content-MS       | `post.created`, `event.*`          | `auth.tokenGenerated`           | ❌ No                      |
| Notifications-MS | —                                  | `follow.*`, `post.*`, `event.*` | ❌ No                      |

---

## Ventajas de ECST

- **Sin acoplamiento en runtime:** ningún MS depende de la disponibilidad de otro.
- **Baja latencia:** Notifications-MS consulta su propia BD, no hace RPC.
- **Tolerancia a fallos:** si Users-MS cae, Notifications-MS sigue funcionando con la réplica que tiene.
- **Escalabilidad:** cada MS escala de forma independiente.

## Trade-offs

- **Consistencia eventual:** la réplica de followers puede estar desactualizada por milisegundos.
- **Almacenamiento duplicado:** `follow_refs` duplica datos de `user_follows`.
- **Complejidad de eventos:** Users-MS debe emitir `follow.created` / `follow.removed` de forma confiable.
