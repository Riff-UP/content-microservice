# Content Microservice

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📌 Descripción

Microservicio encargado del contenido público de Riff. Gestiona publicaciones, eventos, reacciones, asistencia, reseñas, guardados y analítica, con comunicación síncrona vía TCP y eventos asíncronos por RabbitMQ.

## Problema que resuelve

content-ms concentra toda la lógica de contenido para evitar que el gateway o el frontend conozcan detalles internos de persistencia, replicación o validación. También mantiene consistencia entre usuarios, publicaciones y eventos mediante eventos de dominio y réplicas locales.

## Responsabilidades principales

- Crear, consultar, actualizar y eliminar posts.
- Gestionar eventos públicos y sus cambios de estado.
- Manejar reacciones, guardados, asistencia y reseñas.
- Replicar usuarios para validar publicaciones con ECST.
- Publicar eventos de dominio hacia otros servicios.
- Registrar métricas y snapshots de analytics cuando el módulo está habilitado.

## Flujo principal

```text
Gateway -> content-ms -> MongoDB

content-ms -> RabbitMQ -> otros servicios

auth.tokenGenerated -> replica UserRef
createPost -> valida UserRef -> guarda post
post.created / event.created -> notifica por eventos
```

El servicio usa una réplica local de usuario para validar operaciones antes de persistir contenido. Si la réplica aún no existe, reintenta brevemente antes de fallar.

## Modelo de datos

El dominio se organiza principalmente en colecciones y tablas de apoyo para contenido público:

- `Post`: publicaciones del feed.
- `Event`: eventos creados por artistas.
- `UserRef`: réplica de usuario para validación local.
- `SavedPost`: publicaciones guardadas por usuarios.
- `PostReaction`: reacciones sobre publicaciones.
- `EventAttendance` y `EventReview`: asistencia y reseñas.

## Comunicación con otros servicios

- TCP para operaciones solicitadas por el gateway.
- RabbitMQ para eventos como `auth.tokenGenerated`, `post.created`, `event.created` y `user.deactivated`.
- MongoDB como base principal del dominio de contenido.
- PostgreSQL dedicado para analytics cuando el módulo está activo.

## Decisiones técnicas

- ECST para validar usuarios sin acoplarse al microservicio de identidad.
- MongoDB para flexibilidad en publicaciones, eventos y relaciones de contenido.
- PostgreSQL separado para analytics, evitando mezclar cargas transaccionales con métricas.
- El frontend no consume este servicio directamente; siempre entra por el gateway.

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Pruebas

```bash
npm run test
npm run test:e2e
```

## Relación con el sistema

Este microservicio resuelve la capa de contenido de la plataforma. Su valor está en manejar publicaciones y eventos con independencia del gateway, manteniendo la lógica de negocio y la persistencia bien separadas.
