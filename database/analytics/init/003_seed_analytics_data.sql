INSERT INTO analytics.experiment_config (variable_name, variable_value, description)
VALUES
  ('project_id', 'content-ms', 'Identificador textual del microservicio'),
  ('project_id_numeric', '1', 'Identificador numérico asignado al proyecto'),
  ('project_type', 'SOCIAL_NETWORK', 'Tipo de dominio del proyecto'),
  ('db_engine', 'POSTGRESQL', 'Motor de base de datos para analytics'),
  ('db_version', '16', 'Versión de PostgreSQL del contenedor analytics'),
  ('index_strategy', 'BASELINE_INDEX', 'Estrategia de indexación inicial'),
  ('bigquery_project', 'data-from-software', 'Proyecto destino en BigQuery'),
  ('bigquery_dataset', 'benchmarking_warehouse', 'Dataset destino en BigQuery'),
  ('bigquery_table', 'daily_query_metrics', 'Tabla destino en BigQuery'),
  ('registered_email', '', 'Correo académico asociado'),
  ('registered_date', '', 'Fecha de registro académico')
ON CONFLICT (variable_name) DO UPDATE
SET variable_value = EXCLUDED.variable_value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO analytics.benchmark_posts (author_sql_user_id, title, content, created_at, deleted_at)
SELECT
  ((gs - 1) % 80) + 1,
  'Benchmark post #' || gs,
  repeat(md5(gs::text), 2),
  CURRENT_TIMESTAMP - ((gs % 240) || ' hours')::interval,
  CASE WHEN gs % 19 = 0 THEN CURRENT_TIMESTAMP - ((gs % 48) || ' hours')::interval ELSE NULL END
FROM generate_series(1, 800) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_posts);

INSERT INTO analytics.benchmark_events (creator_sql_user_id, title, description, event_date, created_at, cancelled_at)
SELECT
  ((gs - 1) % 60) + 1,
  'Benchmark event #' || gs,
  repeat(md5((gs * 13)::text), 2),
  CURRENT_TIMESTAMP + (((gs % 90) - 45) || ' days')::interval,
  CURRENT_TIMESTAMP - ((gs % 180) || ' hours')::interval,
  CASE WHEN gs % 23 = 0 THEN CURRENT_TIMESTAMP - ((gs % 12) || ' days')::interval ELSE NULL END
FROM generate_series(1, 250) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_events);

INSERT INTO analytics.benchmark_event_attendance (event_id, attendee_sql_user_id, status, responded_at)
SELECT DISTINCT ON (event_id, attendee_sql_user_id)
  ((gs - 1) % 250) + 1,
  ((gs * 7 - 1) % 120) + 1,
  CASE gs % 3 WHEN 0 THEN 'confirmed' WHEN 1 THEN 'pending' ELSE 'declined' END,
  CURRENT_TIMESTAMP - ((gs % 360) || ' hours')::interval
FROM generate_series(1, 1800) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_event_attendance);

INSERT INTO analytics.benchmark_event_reviews (event_id, reviewer_sql_user_id, rating, review_text, created_at)
SELECT DISTINCT ON (event_id, reviewer_sql_user_id)
  ((gs - 1) % 250) + 1,
  ((gs * 11 - 1) % 120) + 1,
  ((gs - 1) % 5) + 1,
  'Review #' || gs || ' ' || md5((gs * 17)::text),
  CURRENT_TIMESTAMP - ((gs % 240) || ' hours')::interval
FROM generate_series(1, 900) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_event_reviews);

INSERT INTO analytics.benchmark_post_reactions (post_id, sql_user_id, reaction_type, created_at)
SELECT DISTINCT ON (post_id, sql_user_id)
  ((gs - 1) % 800) + 1,
  ((gs * 5 - 1) % 120) + 1,
  CASE gs % 4 WHEN 0 THEN 'like' WHEN 1 THEN 'love' WHEN 2 THEN 'fire' ELSE 'clap' END,
  CURRENT_TIMESTAMP - ((gs % 300) || ' hours')::interval
FROM generate_series(1, 2400) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_post_reactions);

INSERT INTO analytics.benchmark_saved_posts (post_id, sql_user_id, saved_at)
SELECT DISTINCT ON (post_id, sql_user_id)
  ((gs - 1) % 800) + 1,
  ((gs * 3 - 1) % 120) + 1,
  CURRENT_TIMESTAMP - ((gs % 500) || ' hours')::interval
FROM generate_series(1, 2200) AS gs
WHERE NOT EXISTS (SELECT 1 FROM analytics.benchmark_saved_posts);

INSERT INTO analytics.queries (query_name, category, query_text, description)
VALUES
  ('posts_list_paginated', 'posts', 'SELECT id, title, author_sql_user_id, created_at FROM analytics.benchmark_posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2', 'Lista paginada de posts activos'),
  ('posts_by_user', 'posts', 'SELECT id, title, created_at FROM analytics.benchmark_posts WHERE author_sql_user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2', 'Posts activos creados por un usuario'),
  ('post_find_one', 'posts', 'SELECT id, title, content, created_at FROM analytics.benchmark_posts WHERE id = $1 AND deleted_at IS NULL LIMIT 1', 'Detalle de un post activo por id'),
  ('posts_soft_delete_user', 'posts', 'UPDATE analytics.benchmark_posts SET deleted_at = CURRENT_TIMESTAMP WHERE author_sql_user_id = $1 AND deleted_at IS NULL AND id % 97 = 0', 'Borrado lógico parcial de posts por usuario'),
  ('posts_count_active', 'posts', 'SELECT COUNT(*) AS total_active_posts FROM analytics.benchmark_posts WHERE deleted_at IS NULL', 'Conteo total de posts activos'),
  ('events_list_paginated', 'events', 'SELECT id, title, event_date, creator_sql_user_id FROM analytics.benchmark_events WHERE cancelled_at IS NULL ORDER BY event_date ASC LIMIT $1 OFFSET $2', 'Lista paginada de eventos activos'),
  ('events_upcoming', 'events', 'SELECT id, title, event_date FROM analytics.benchmark_events WHERE event_date > CURRENT_TIMESTAMP AND cancelled_at IS NULL ORDER BY event_date ASC LIMIT $1', 'Lista de eventos futuros'),
  ('events_by_user', 'events', 'SELECT id, title, created_at FROM analytics.benchmark_events WHERE creator_sql_user_id = $1 AND cancelled_at IS NULL ORDER BY created_at DESC LIMIT $2', 'Eventos creados por un usuario'),
  ('event_find_one', 'events', 'SELECT id, title, description, event_date FROM analytics.benchmark_events WHERE id = $1 AND cancelled_at IS NULL LIMIT 1', 'Detalle de evento activo por id'),
  ('events_recent', 'events', 'SELECT id, title, created_at FROM analytics.benchmark_events ORDER BY created_at DESC LIMIT $1', 'Eventos recientes del sistema'),
  ('attendance_by_event', 'attendance', 'SELECT attendee_sql_user_id, status, responded_at FROM analytics.benchmark_event_attendance WHERE event_id = $1 ORDER BY responded_at DESC LIMIT $2', 'Asistentes de un evento'),
  ('attendance_by_user', 'attendance', 'SELECT event_id, status, responded_at FROM analytics.benchmark_event_attendance WHERE attendee_sql_user_id = $1 ORDER BY responded_at DESC LIMIT $2', 'Eventos asociados a un usuario asistente'),
  ('attendance_status_count', 'attendance', 'SELECT status, COUNT(*) AS total FROM analytics.benchmark_event_attendance WHERE event_id = $1 GROUP BY status', 'Conteo de asistencias por estado'),
  ('reviews_by_event', 'reviews', 'SELECT event_id, AVG(rating)::NUMERIC(10,2) AS avg_rating, COUNT(*) AS total_reviews FROM analytics.benchmark_event_reviews WHERE event_id = $1 GROUP BY event_id', 'Promedio de rating y total de reseñas por evento'),
  ('reviews_by_user', 'reviews', 'SELECT event_id, rating, created_at FROM analytics.benchmark_event_reviews WHERE reviewer_sql_user_id = $1 ORDER BY created_at DESC LIMIT $2', 'Reseñas emitidas por usuario'),
  ('reactions_by_post', 'reactions', 'SELECT reaction_type, COUNT(*) AS total FROM analytics.benchmark_post_reactions WHERE post_id = $1 GROUP BY reaction_type', 'Conteo de reacciones por tipo en un post'),
  ('saved_posts_by_user', 'saved_posts', 'SELECT post_id, saved_at FROM analytics.benchmark_saved_posts WHERE sql_user_id = $1 ORDER BY saved_at DESC LIMIT $2', 'Posts guardados por usuario'),
  ('saved_posts_top', 'saved_posts', 'SELECT post_id, COUNT(*) AS saves FROM analytics.benchmark_saved_posts GROUP BY post_id ORDER BY saves DESC LIMIT $1', 'Ranking de posts más guardados')
ON CONFLICT (query_name) DO UPDATE
SET category = EXCLUDED.category,
    query_text = EXCLUDED.query_text,
    description = EXCLUDED.description,
    is_active = true;
