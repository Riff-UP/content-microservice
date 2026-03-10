import { AnalyticsQueryDefinition } from './types';

export const PREDEFINED_ANALYTICS_QUERIES: AnalyticsQueryDefinition[] = [
  {
    queryName: 'posts_list_paginated',
    category: 'posts',
    description: 'Lista paginada de posts activos',
    sql: 'SELECT id, title, author_sql_user_id, created_at FROM analytics.benchmark_posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
  },
  {
    queryName: 'posts_by_user',
    category: 'posts',
    description: 'Posts activos creados por un usuario',
    sql: 'SELECT id, title, created_at FROM analytics.benchmark_posts WHERE author_sql_user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2',
  },
  {
    queryName: 'post_find_one',
    category: 'posts',
    description: 'Detalle de un post activo por id',
    sql: 'SELECT id, title, content, created_at FROM analytics.benchmark_posts WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
  },
  {
    queryName: 'posts_soft_delete_user',
    category: 'posts',
    description: 'Borrado lógico parcial de posts por usuario',
    sql: 'UPDATE analytics.benchmark_posts SET deleted_at = CURRENT_TIMESTAMP WHERE author_sql_user_id = $1 AND deleted_at IS NULL AND id % 97 = 0',
  },
  {
    queryName: 'posts_count_active',
    category: 'posts',
    description: 'Conteo total de posts activos',
    sql: 'SELECT COUNT(*) AS total_active_posts FROM analytics.benchmark_posts WHERE deleted_at IS NULL',
  },
  {
    queryName: 'events_list_paginated',
    category: 'events',
    description: 'Lista paginada de eventos activos',
    sql: 'SELECT id, title, event_date, creator_sql_user_id FROM analytics.benchmark_events WHERE cancelled_at IS NULL ORDER BY event_date ASC LIMIT $1 OFFSET $2',
  },
  {
    queryName: 'events_upcoming',
    category: 'events',
    description: 'Lista de eventos futuros',
    sql: 'SELECT id, title, event_date FROM analytics.benchmark_events WHERE event_date > CURRENT_TIMESTAMP AND cancelled_at IS NULL ORDER BY event_date ASC LIMIT $1',
  },
  {
    queryName: 'events_by_user',
    category: 'events',
    description: 'Eventos creados por un usuario',
    sql: 'SELECT id, title, created_at FROM analytics.benchmark_events WHERE creator_sql_user_id = $1 AND cancelled_at IS NULL ORDER BY created_at DESC LIMIT $2',
  },
  {
    queryName: 'event_find_one',
    category: 'events',
    description: 'Detalle de evento activo por id',
    sql: 'SELECT id, title, description, event_date FROM analytics.benchmark_events WHERE id = $1 AND cancelled_at IS NULL LIMIT 1',
  },
  {
    queryName: 'events_recent',
    category: 'events',
    description: 'Eventos recientes del sistema',
    sql: 'SELECT id, title, created_at FROM analytics.benchmark_events ORDER BY created_at DESC LIMIT $1',
  },
  {
    queryName: 'attendance_by_event',
    category: 'attendance',
    description: 'Asistentes de un evento',
    sql: 'SELECT attendee_sql_user_id, status, responded_at FROM analytics.benchmark_event_attendance WHERE event_id = $1 ORDER BY responded_at DESC LIMIT $2',
  },
  {
    queryName: 'attendance_by_user',
    category: 'attendance',
    description: 'Eventos asociados a un usuario asistente',
    sql: 'SELECT event_id, status, responded_at FROM analytics.benchmark_event_attendance WHERE attendee_sql_user_id = $1 ORDER BY responded_at DESC LIMIT $2',
  },
  {
    queryName: 'attendance_status_count',
    category: 'attendance',
    description: 'Conteo de asistencias por estado',
    sql: 'SELECT status, COUNT(*) AS total FROM analytics.benchmark_event_attendance WHERE event_id = $1 GROUP BY status',
  },
  {
    queryName: 'reviews_by_event',
    category: 'reviews',
    description: 'Promedio de rating y total de reseñas por evento',
    sql: 'SELECT event_id, AVG(rating)::NUMERIC(10,2) AS avg_rating, COUNT(*) AS total_reviews FROM analytics.benchmark_event_reviews WHERE event_id = $1 GROUP BY event_id',
  },
  {
    queryName: 'reviews_by_user',
    category: 'reviews',
    description: 'Reseñas emitidas por usuario',
    sql: 'SELECT event_id, rating, created_at FROM analytics.benchmark_event_reviews WHERE reviewer_sql_user_id = $1 ORDER BY created_at DESC LIMIT $2',
  },
  {
    queryName: 'reactions_by_post',
    category: 'reactions',
    description: 'Conteo de reacciones por tipo en un post',
    sql: 'SELECT reaction_type, COUNT(*) AS total FROM analytics.benchmark_post_reactions WHERE post_id = $1 GROUP BY reaction_type',
  },
  {
    queryName: 'saved_posts_by_user',
    category: 'saved_posts',
    description: 'Posts guardados por usuario',
    sql: 'SELECT post_id, saved_at FROM analytics.benchmark_saved_posts WHERE sql_user_id = $1 ORDER BY saved_at DESC LIMIT $2',
  },
  {
    queryName: 'saved_posts_top',
    category: 'saved_posts',
    description: 'Ranking de posts más guardados',
    sql: 'SELECT post_id, COUNT(*) AS saves FROM analytics.benchmark_saved_posts GROUP BY post_id ORDER BY saves DESC LIMIT $1',
  },
];
