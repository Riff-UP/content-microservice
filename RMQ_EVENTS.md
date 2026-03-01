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
