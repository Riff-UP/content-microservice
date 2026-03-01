# Event-Carried State Transfer Pattern

## ¿Qué es?

Patrón de comunicación entre microservicios donde los eventos llevan **toda la información necesaria** (no solo IDs). Cada MS guarda una **réplica local** de los datos que necesita de otros MS, eliminando la necesidad de llamadas sincrónicas entre servicios.

---

## Diagrama de Flujo

```
                         RabbitMQ (Fanout)
                              │
  Gateway ── emit(evento) ──► ├──► Content-MS    → guarda réplica en Mongo
                              ├──► Notifications-MS → guarda su copia
                              └──► Otro MS       → guarda su copia
```

---

## Flujo Paso a Paso

### 1. Usuario inicia sesión (evento de autenticación)

```
Usuario ──► Gateway (POST /auth/login)
                │
                ├─ Valida credenciales
                ├─ Genera JWT
                │
                └─ emit('auth.tokenGenerated', {
                     user: {
                       user_id: '550e...',
                       name: 'Juan',
                       email: 'juan@mail.com',
                       role: 'user',
                       picture: 'https://...'
                     },
                     token: 'eyJhbG...'
                   })
```

### 2. Content-MS recibe el evento y guarda réplica

```
Content-MS (consumer)
  │
  @EventPattern('auth.tokenGenerated')
  │
  └─ usersService.upsert({
       user_id: '550e...',
       name: 'Juan',
       email: 'juan@mail.com',
       token: 'eyJhbG...'
     })
     │
     └─ Mongo (colección user_refs) → INSERT/UPDATE
```

### 3. Usuario crea un post (RPC, sin token en payload)

```
Usuario ──► Gateway (POST /posts)
                │
                ├─ AuthGuard extrae user del JWT
                │
                └─ send('createPost', {
                     sql_user_id: '550e...',
                     type: 'image',
                     title: 'Mi foto',
                     url: 'https://example.com/foto.jpg'
                   })
                   │
                   ▼
            Content-MS (controller)
                   │
                   ├─ A) usersService.get(sql_user_id)
                   │     → consulta Mongo local (user_refs)
                   │     → obtiene { name, email, token, ... }
                   │
                   ├─ B) createPostService.create(dto, userRef)
                   │     → usa userRef.token para fetch de imagen
                   │     → persiste post en Mongo (colección posts)
                   │
                   └─ C) return { id, title, url }
                          │
                          ▼
                   Gateway recibe respuesta
                          │
                          ▼
                   Usuario recibe HTTP 201
```

---

## Estructura de Archivos

```
src/
├── users/
│   ├── schemas/
│   │   └── user-ref.schema.ts      # Esquema Mongo (réplica ligera)
│   ├── users.service.ts            # upsert() y get() contra Mongo
│   └── users.module.ts             # Exporta UsersService
│
├── posts/
│   ├── posts.consumer.controller.ts # Escucha auth.tokenGenerated
│   │                                 # Llama usersService.upsert()
│   │
│   ├── posts.controller.ts          # Escucha createPost (RPC)
│   │                                 # Llama usersService.get()
│   │                                 # Luego createPostService.create()
│   │
│   └── services/
│       └── createPost.service.ts    # Lógica de creación
```

---

## Esquema de Réplica Local

```typescript
// src/users/schemas/user-ref.schema.ts
@Schema({ timestamps: true })
export class UserRef {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop()
  token?: string;

  @Prop()
  role?: string;

  @Prop()
  picture?: string;
}
```

> **Nota**: Esta colección es una réplica ligera. No es la fuente de verdad — esa vive en el Users-MS / Auth-MS.

---

## Manejo de Casos Especiales

### ¿Qué pasa si `createPost` llega ANTES que `auth.tokenGenerated`?

```
usersService.get(sql_user_id) → null

Opciones:
├── A) Rechazar → throw Error('User not replicated yet')
├── B) Reintentar → esperar N ms y reintentar get()
└── C) Fallback → hacer RPC al Users-MS para obtener datos
```

### ¿Qué pasa si el usuario actualiza su perfil?

```
Gateway emite 'user.updated' con datos nuevos
         │
         ▼
Content-MS consumer → upsert actualiza user_refs
         │
         ▼
Próxima llamada a get(sql_user_id) → datos frescos
```

### ¿Qué pasa si el token expira?

```
Gateway emite 'auth.tokenGenerated' con nuevo token al re-autenticar
         │
         ▼
Content-MS consumer → upsert sobreescribe token viejo
```

---

## Comparación con Otros Enfoques

| Aspecto                 | Token en Payload | Event-Carried (réplica) | RPC a otro MS        |
| ----------------------- | ---------------- | ----------------------- | -------------------- |
| Complejidad             | Baja             | Media                   | Media                |
| Dependencia runtime     | Ninguna          | Ninguna                 | Alta                 |
| Datos siempre frescos   | ✅               | ⚠️ Eventual             | ✅                   |
| Latencia                | Baja             | Baja                    | Alta (red)           |
| Escala                  | ✅               | ✅                      | ❌ Cuello de botella |
| Requiere caché/DB extra | ❌               | ✅ (Mongo)              | ❌                   |

---

## Cuándo Usar Este Patrón

✅ **Usar cuando:**

- Necesitas datos de otro MS frecuentemente (nombre de autor, avatar, etc.)
- Quieres evitar llamadas sincrónicas entre MS
- Necesitas que el MS funcione independientemente aunque otro MS esté caído

❌ **No usar cuando:**

- Solo necesitas un dato puntual en una operación específica (mejor token en payload)
- Los datos cambian cada segundo y necesitas la última versión siempre
- El volumen de eventos es altísimo y la réplica consume demasiados recursos

---

## Eventos Soportados

| Evento                | Origen         | Datos             | Acción en Content-MS      |
| --------------------- | -------------- | ----------------- | ------------------------- |
| `auth.tokenGenerated` | Gateway (auth) | `{ user, token }` | `upsert()` en `user_refs` |
| `user.updated`        | Users-MS       | `{ user }`        | `upsert()` en `user_refs` |
| `user.deleted`        | Users-MS       | `{ user_id }`     | `delete()` en `user_refs` |

---

## Referencias

- [NestJS Microservices - Events](https://docs.nestjs.com/microservices/basics#event-based)
- [NestJS Microservices - Request-Response](https://docs.nestjs.com/microservices/basics#request-response)
- [Martin Fowler - Event-Carried State Transfer](https://martinfowler.com/articles/201701-event-driven.html)
- [RabbitMQ Exchanges (Fanout)](https://www.rabbitmq.com/tutorials/tutorial-three-javascript)
