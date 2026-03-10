CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE IF NOT EXISTS analytics.queries (
    id SERIAL PRIMARY KEY,
    query_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    query_text TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.experiment_config (
    id SERIAL PRIMARY KEY,
    variable_name VARCHAR(100) UNIQUE NOT NULL,
    variable_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.query_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    snapshot_type VARCHAR(50) NOT NULL DEFAULT 'manual',
    sent_to_bigquery BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    metrics_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_posts (
    id BIGSERIAL PRIMARY KEY,
    author_sql_user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_events (
    id BIGSERIAL PRIMARY KEY,
    creator_sql_user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_event_attendance (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES analytics.benchmark_events(id) ON DELETE CASCADE,
    attendee_sql_user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, attendee_sql_user_id)
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_event_reviews (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES analytics.benchmark_events(id) ON DELETE CASCADE,
    reviewer_sql_user_id BIGINT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, reviewer_sql_user_id)
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_post_reactions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES analytics.benchmark_posts(id) ON DELETE CASCADE,
    sql_user_id BIGINT NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, sql_user_id)
);

CREATE TABLE IF NOT EXISTS analytics.benchmark_saved_posts (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES analytics.benchmark_posts(id) ON DELETE CASCADE,
    sql_user_id BIGINT NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, sql_user_id)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_posts_author_created ON analytics.benchmark_posts(author_sql_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_posts_active_created ON analytics.benchmark_posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_benchmark_events_creator_created ON analytics.benchmark_events(creator_sql_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_events_date_active ON analytics.benchmark_events(event_date ASC) WHERE cancelled_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_benchmark_attendance_event ON analytics.benchmark_event_attendance(event_id, responded_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_attendance_user ON analytics.benchmark_event_attendance(attendee_sql_user_id, responded_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_reviews_event ON analytics.benchmark_event_reviews(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_reviews_user ON analytics.benchmark_event_reviews(reviewer_sql_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_reactions_post ON analytics.benchmark_post_reactions(post_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_benchmark_saved_posts_user ON analytics.benchmark_saved_posts(sql_user_id, saved_at DESC);
