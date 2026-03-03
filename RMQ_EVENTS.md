# Lista de eventos RMQ emitidos

Este documento lista las emisiones RMQ detectadas en el repositorio y el payload enviado.

- **event.created**: notifica la creación de un evento.
  - Nombre del evento: `'event.created'`
  - Archivos: [src/events/services/createEvent.service.ts](src/events/services/createEvent.service.ts#L35-L55)
  - Payload (ejemplo): `{ type: 'new_event', message: string, userId: number, eventId: string }`

- **event.updated**: notifica la actualización de un evento.
  - Nombre del evento: `'event.updated'`
  - Archivos: [src/events/services/updateEvent.service.ts](src/events/services/updateEvent.service.ts#L40-L56)
  - Payload (ejemplo): `{ type: 'event_update', message: string, userId: number, eventId: string }`

- **event.cancelled**: notifica la cancelación/eliminación de un evento.
  - Nombre del evento: `'event.cancelled'`
  - Archivos: [src/events/services/removeEvent.service.ts](src/events/services/removeEvent.service.ts#L40-L56)
  - Payload (ejemplo): `{ type: 'event_cancelled', message: string, userId: number, eventId: string }`

- **post.created**: notifica la creación de un post.
  - Nombre del evento: `'post.created'`
  - Archivos: [src/posts/services/createPost.service.ts](src/posts/services/createPost.service.ts#L120-L140)
  - Payload (ejemplo): `{ type: 'new_post', message: string, userId: number, postId: string }`

- **user.publishedContent**: evento para promover al usuario a rol ARTIST tras publicar contenido.
  - Nombre del evento: `'user.publishedContent'`
  - Archivos:
    - [src/posts/services/createPost.service.ts](src/posts/services/createPost.service.ts#L120-L140)
    - [src/events/services/createEvent.service.ts](src/events/services/createEvent.service.ts#L35-L55)
  - Payload (ejemplo): `{ userId: number }`

---

Notas:

- Se buscaron llamadas a `ClientProxy.emit` / `.emit(` en el código fuente.
- Si quieres que incluya más contexto (líneas exactas del payload o listeners que consumen estos eventos), indícalo y lo añado.

# RabbitMQ Events — Content Microservice

Eventos emitidos hacia la cola `riff_queue` para ser consumidos por **Notifications-MS**.

> **Arquitectura:** Event-Carried State Transfer (ECST).  
> Content-MS **no** envía followers. Solo emite `userId` del autor.  
> Notifications-MS mantiene una réplica local de followers y resuelve los destinatarios por su cuenta.  
> Ver [ECST_FLOW.md](ECST_FLOW.md) para el flujo completo.

---

## `post.created`

Emitido cuando se crea un nuevo post.

```json
{
  "type": "new_post",
  "message": "New post: {title}",
  "userId": "sql_user_id del autor",
  "postId": "mongo _id del post"
}
```

---

## `event.created`

Emitido cuando se crea un nuevo evento.

```json
{
  "type": "new_event",
  "message": "New event: {title}",
  "userId": "sql_user_id del creador",
  "eventId": "mongo _id del evento"
}
```

---

## `event.updated`

Emitido cuando se actualiza un evento existente.

```json
{
  "type": "event_update",
  "message": "Event updated: {title}",
  "userId": "sql_user_id del creador",
  "eventId": "mongo _id del evento"
}
```

---

## `event.cancelled`

Emitido cuando se elimina un evento.

```json
{
  "type": "event_cancelled",
  "message": "Event cancelled: {title}",
  "userId": "sql_user_id del creador",
  "eventId": "mongo _id del evento"
}
```

---

## Mapeo a tabla `notifications`

| Campo BD           | Origen                              |
| ------------------ | ----------------------------------- |
| `user_id_receiver` | `follower_id` de réplica local      |
| `type`             | `type` del payload de Content-MS    |
| `message`          | `message` del payload de Content-MS |
| `created_at`       | Autogenerado por Notifications-MS   |
