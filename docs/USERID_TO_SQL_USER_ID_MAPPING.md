# ✅ Mapeo userId → sql_user_id Implementado

## 📋 Resumen

Se implementó la transformación automática de `userId` a `sql_user_id` en **TODOS** los controladores que lo requieren.

## 🔄 Cambios Realizados

### 1. **Posts** (`posts.controller.ts`)
- ✅ `createPost` - Mapea `userId` → `sql_user_id`
- ✅ `updatePost` - Mapea `userId` → `sql_user_id`

### 2. **Events** (`events.controller.ts`)
- ✅ `createEvent` - Mapea `userId` → `sql_user_id`
- ✅ `updateEvent` - Mapea `userId` → `sql_user_id`

### 3. **Saved Posts** (`saved-posts.controller.ts`)
- ✅ `createSavedPost` - Mapea `userId` → `sql_user_id`
- ✅ `findSavedPostsByUser` - Mapea `userId` → `sql_user_id`

### 4. **Post Reactions** (`post-reactions.controller.ts`)
- ✅ `createPostReaction` - Mapea `userId` → `sql_user_id`

### 5. **Event Reviews** (`event-reviews.controller.ts`)
- ✅ `createEventReview` - Mapea `userId` → `sql_user_id`
- ✅ `updateEventReview` - Mapea `userId` → `sql_user_id`

### 6. **Event Attendance** (`event-attendance.controller.ts`)
- ✅ `createEventAttendance` - Mapea `userId` → `sql_user_id`
- ✅ `updateEventAttendance` - Mapea `userId` → `sql_user_id`

---

## 🔍 Cómo Funciona

Cada controlador ahora acepta **ambos formatos**:

```typescript
@MessagePattern('createEvent')
create(@Payload() payload: any) {
  // Transforma automáticamente userId → sql_user_id
  const dto: CreateEventDto = {
    ...payload,
    sql_user_id: payload.sql_user_id || payload.userId, // ✅ Fallback
  };
  
  return this.createEventService.execute(dto);
}
```

### Flujo:
1. **Gateway envía**: `{ userId: "abc123", title: "..." }`
2. **Controlador recibe**: Detecta que viene `userId`
3. **Controlador transforma**: Mapea a `sql_user_id`
4. **Servicio procesa**: Usa `sql_user_id` normalmente

---

## 📊 Compatibilidad

| Formato de Entrada | ¿Funciona? | Comentario |
|-------------------|-----------|-----------|
| `{ userId: "..." }` | ✅ | Gateway envía esto |
| `{ sql_user_id: "..." }` | ✅ | Formato interno del MS |
| Ambos campos presentes | ✅ | Prioriza `sql_user_id` |

---

## 🚨 Importante

- **NO es necesario cambiar el gateway** - El content-ms ahora acepta ambos formatos
- **Todos los DTOs mantienen `sql_user_id`** internamente
- **La transformación es transparente** - Los servicios no cambiaron

---

## 🧪 Testing

Para probar que funciona:

1. Desde el gateway, envía solo `userId`:
```json
{
  "userId": "13de4750-500d-4912-8178-388dabcbc962",
  "title": "Test Event"
}
```

2. El content-ms debería aceptarlo y crear el evento correctamente

3. Revisar logs:
```bash
docker logs riff_content_ms --tail 50
```

Deberías ver:
```
📥 Received createEvent with payload: {"userId":"13de...","title":"Test Event"}
🔄 Transformed DTO with sql_user_id: 13de...
```

---

## 📝 Notas Adicionales

- Se agregaron logs para debugging en los métodos de creación/actualización
- Todos los controladores ahora tienen un `Logger` para tracking
- Los errores de ESLint relacionados con `any` son aceptables en este caso (ya que estamos haciendo transformación dinámica)

